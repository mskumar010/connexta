import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/app/store";
import { setConversations, setActiveConversation } from "./conversationsSlice";
import { formatDistanceToNow } from "date-fns";
import { User, MessageCircle, Hash } from "lucide-react";
import { useConversationSocket } from "@/hooks/useConversationSocket";
import { useGetConversationsQuery } from "@/api/conversationsApi";
import { useGetRoomsQuery } from "@/api/roomsApi";
import type { Conversation, Room, UIMessage } from "@/types";

interface ConversationListProps {
  filter?: "all" | "dm" | "room";
}

export const ConversationList = ({ filter = "all" }: ConversationListProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeConversationId } = useSelector(
    (state: RootState) => state.conversations
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useConversationSocket();

  // Fetch DMs
  const { data: dms, isLoading: dmsLoading } = useGetConversationsQuery();

  // Fetch Rooms
  const { data: rooms, isLoading: roomsLoading } = useGetRoomsQuery();

  // Unified list logic
  const unifiedList = useMemo(() => {
    if (!user) return [];

    let processedDMs: any[] = [];
    if (filter === "all" || filter === "dm") {
      processedDMs = (dms || [])
        .map((dm) => ({
          ...dm,
          isRoom: false,
          displayDate: dm.lastMessageAt
            ? new Date(dm.lastMessageAt)
            : new Date(dm.createdAt),
        }))
        // Filter out incoming pending requests
        .filter(
          (dm) => !(dm.status === "pending" && dm.initiatorId !== user._id)
        );
    }

    let processedRooms: any[] = [];
    if (filter === "all" || filter === "room") {
      const joinedRooms = (rooms || []).filter((room) =>
        room.members.includes(user._id)
      );

      processedRooms = joinedRooms.map((room) => ({
        ...room,
        _id: room._id,
        participants: [],
        lastMessage: undefined, // Room objects might not have lastMessage cached
        lastMessageAt: room.updatedAt, // Fallback
        type: "room",
        isRoom: true,
        displayDate: new Date(room.updatedAt || room.createdAt),
      }));
    }

    // Merge and Sort
    return [...processedDMs, ...processedRooms].sort(
      (a, b) => b.displayDate.getTime() - a.displayDate.getTime()
    );
  }, [dms, rooms, user, filter]);

  const handleSelectConversation = (item: any) => {
    // ... existing logic ...
    if (item.isRoom) {
      navigate(`/room/${item._id}`);
    } else {
      dispatch(setActiveConversation(item._id));
      navigate(`/chat/${item._id}`);
    }
  };

  if (dmsLoading || roomsLoading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {unifiedList.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            {filter === "room"
              ? "You haven't joined any rooms yet."
              : "No active conversations."}
          </div>
        )}
        {unifiedList.map((item: any) => {
          // ... render logic ...
          // Copying existing render logic inside map
          const isActive =
            item._id === activeConversationId ||
            window.location.pathname.includes(item._id);

          let displayName = "Unknown";
          let avatarUrl = undefined;
          let lastMessageText = item.lastMessage?.text || "No messages yet";

          if (item.isRoom) {
            displayName = item.name;
          } else {
            const otherParticipant = item.participants.find(
              (p: any) => p._id !== user?._id
            );
            displayName = otherParticipant?.displayName || "Unknown User";
            avatarUrl = otherParticipant?.avatarUrl;
          }

          return (
            <div
              key={item._id}
              onClick={() => handleSelectConversation(item)}
              className={`p-3 cursor-pointer hover:bg-gray-800 transition-colors ${
                isActive ? "bg-gray-800" : ""
              }`}
              title={displayName}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : item.isRoom ? (
                    <Hash size={20} className="text-gray-400" />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-100 truncate">
                      {displayName}
                    </h3>
                    {item.displayDate && (
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {formatDistanceToNow(item.displayDate, {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {lastMessageText}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
