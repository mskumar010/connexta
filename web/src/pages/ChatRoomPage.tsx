import { useState, useMemo, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChatArea } from "@/components/layout/ChatArea";
import { MessageList } from "@/features/chat/components/MessageList";
import { MessageInput } from "@/features/chat/components/MessageInput";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import {
  useGetRoomQuery,
  useJoinRoomMutation,
  useLeaveRoomMutation,
} from "@/api/roomsApi";
import { RoomDetailsModal } from "@/features/rooms/components/RoomDetailsModal";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import type { RootState } from "@/app/store";
import type { UIMessage } from "@/types";

export function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const currentRoomId = roomId || "general";
  const [replyingTo, setReplyingTo] = useState<UIMessage | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const messages = useSelector(
    (state: RootState) => state.chat.messages[currentRoomId] || []
  );
  const typingUsers = useSelector(
    (state: RootState) => state.chat.typingUsers[currentRoomId] || []
  );
  const userCount = useSelector(
    (state: RootState) => state.chat.userCounts[currentRoomId] || 0
  );

  // Connect to room socket
  const { isLoading } = useRoomSocket({
    roomId: currentRoomId,
    userId: user?._id || "",
  });

  // Typing user names (placeholder - will get from Redux later)
  const typingUserNames = useMemo(() => {
    const names: { [key: string]: string } = {};
    typingUsers.forEach((userId) => {
      if (typeof userId === "string") {
        names[userId] = `User ${userId.slice(0, 4)}`;
      }
    });
    return names;
  }, [typingUsers]);

  const { data: room } = useGetRoomQuery(currentRoomId);
  const [joinRoom, { isLoading: isJoining }] = useJoinRoomMutation();

  const isMember = room?.members?.includes(user?._id || "") || false;

  const handleJoin = async () => {
    try {
      await joinRoom(currentRoomId).unwrap();
      toast.success("Joined room successfully");
    } catch (error) {
      toast.error("Failed to join room");
    }
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [leaveRoom, { isLoading: isLeaving }] = useLeaveRoomMutation();

  const handleLeave = async () => {
    try {
      await leaveRoom(currentRoomId).unwrap();
      toast.success("Left room successfully");
    } catch (error) {
      toast.error("Failed to leave room");
    }
  };

  return (
    <>
      <ChatArea
        header={
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <span className="text-[var(--color-brand-primary)] opacity-80">
                  #
                </span>
                {room?.name || currentRoomId}
              </span>
              {userCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                  {userCount} online
                </span>
              )}
              {!isMember && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  Preview Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Cog6ToothIcon className="h-6 w-6" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-700 rounded-xl bg-[var(--color-bg-secondary)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 backdrop-blur-xl border border-white/5">
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setIsDetailsOpen(true)}
                            className={`${
                              active
                                ? "bg-[var(--color-brand-primary)] text-white"
                                : "text-gray-300"
                            } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                          >
                            Details
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                    {isMember && (
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLeave}
                              disabled={isLeaving}
                              className={`${
                                active
                                  ? "bg-red-500/10 text-red-400"
                                  : "text-red-400"
                              } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                            >
                              {isLeaving ? "Leaving..." : "Leave Room"}
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        }
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-hidden">
            <MessageList
              messages={messages}
              typingUserIds={typingUsers}
              typingUserNames={typingUserNames}
              isLoading={isLoading}
              onReply={setReplyingTo}
            />
          </div>
          {isMember ? (
            <MessageInput
              roomId={currentRoomId}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          ) : (
            <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-gray-400">
                  You are viewing this room in preview mode. Join to participate
                  in the conversation.
                </p>
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? "Joining..." : "Join Room"}
                </button>
              </div>
            </div>
          )}
        </div>
      </ChatArea>

      {room && (
        <RoomDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          room={room}
          memberCount={room.members?.length || 0}
        />
      )}
    </>
  );
}
