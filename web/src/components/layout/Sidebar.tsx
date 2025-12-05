import { useNavigate, useLocation } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { ConversationList } from "@/features/conversations/ConversationList";
import { NavigationRail } from "@/components/layout/NavigationRail";
import {
  MessageSquare,
  UserPlus,
  CircleHelp,
  Compass,
  Map as MapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "@/api/conversationsApi";
import { useGetUsersQuery } from "@/api/usersApi";
import { useSearchParams } from "react-router-dom";
import { Avatar } from "@/components/common/Avatar";
import toast from "react-hot-toast";
import type { RootState } from "@/app/store";
import { RoomDiscoveryView } from "@/features/rooms/RoomDiscoveryView";
import { ConnectView } from "@/features/conversations/ConnectView";
import { PendingRequestsView } from "@/features/conversations/PendingRequestsView";

type SubTab = "list" | "add" | "pending";
type RoomsSubTab = "my" | "discover";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Local state for 'Chats' sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("list");
  // Local state for 'Rooms' sub-tabs
  const [roomsSubTab, setRoomsSubTab] = useState<RoomsSubTab>("discover"); // Default to discover to show default channels

  const { user } = useSelector((state: RootState) => state.auth);
  // We need to fetch conversations here to check for pending requests count
  const { data: conversations } = useGetConversationsQuery();

  const pendingCount =
    conversations?.filter(
      (c) => c.status === "pending" && c.initiatorId !== user?._id
    ).length || 0;

  // Determine active main tab based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/rooms")) return "rooms";
    if (path.startsWith("/map")) return "map";
    return "chats";
  };

  const activeTab = getActiveTab();

  const handleTabChange = useCallback(
    (tab: "chats" | "rooms" | "map") => {
      if (tab === "chats") navigate("/");
      if (tab === "rooms") navigate("/rooms");
      if (tab === "map") navigate("/map");
    },
    [navigate]
  );

  const pendingRequests = useMemo(
    () =>
      conversations?.filter(
        (c) => c.status === "pending" && c.initiatorId !== user?._id
      ) || [],
    [conversations, user]
  );

  return (
    <div className="flex h-full bg-[var(--color-bg-primary)]">
      <NavigationRail activeTab={activeTab} onTabChange={handleTabChange} />

      <aside className="flex w-80 flex-col border-r border-white/5 bg-[var(--color-bg-secondary)]/90 backdrop-blur-md">
        {/* If in Chats Mode, show Tab Switcher */}
        {activeTab === "chats" && (
          <div className="flex flex-col border-b border-white/5">
            {/* Sub Tabs */}
            <div className="flex px-3 pb-3 pt-2 gap-2">
              <button
                onClick={() => setActiveSubTab("list")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                  activeSubTab === "list"
                    ? "bg-[var(--color-bg-tertiary)] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <MessageSquare size={16} />
                <span>All</span>
              </button>
              <button
                onClick={() => setActiveSubTab("add")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                  activeSubTab === "add"
                    ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-accent)] border border-[var(--color-brand-primary)]/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <UserPlus size={16} />
                <span>Add</span>
              </button>
              <button
                onClick={() => setActiveSubTab("pending")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 relative",
                  activeSubTab === "pending"
                    ? "bg-[var(--color-bg-tertiary)] text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <div className="relative">
                  <CircleHelp size={16} />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--color-bg-secondary)]" />
                  )}
                </div>
                <span>Pending</span>
              </button>
            </div>
          </div>
        )}

        {/* If in Rooms Mode, show Sub Tabs (My Rooms | Discover) */}
        {activeTab === "rooms" && (
          <div className="flex flex-col border-b border-white/5">
            <div className="flex px-3 pb-3 pt-5 gap-2">
              <button
                onClick={() => setRoomsSubTab("my")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                  roomsSubTab === "my"
                    ? "bg-[var(--color-bg-tertiary)] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <span>My Rooms</span>
              </button>
              <button
                onClick={() => setRoomsSubTab("discover")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                  roomsSubTab === "discover"
                    ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-accent)] border border-[var(--color-brand-primary)]/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <Compass size={16} />
                <span>Discover</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="h-16 flex items-center px-6 border-b border-white/5 bg-[var(--color-bg-secondary)]/50">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MapIcon className="text-[var(--color-brand-accent)]" size={24} />
              Map View
            </h1>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-[var(--color-bg-secondary)]/50">
          {activeTab === "chats" && (
            <>
              {activeSubTab === "list" && <ConversationList filter="dm" />}
              {activeSubTab === "add" && <ConnectView />}
              {activeSubTab === "pending" && (
                <PendingRequestsView pendingConversations={pendingRequests} />
              )}
            </>
          )}

          {activeTab === "rooms" && (
            <>
              {roomsSubTab === "my" && <ConversationList filter="room" />}
              {roomsSubTab === "discover" && <RoomDiscoveryView />}
            </>
          )}

          {activeTab === "map" && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-white/10">
                <p className="text-xs text-gray-500">
                  Select a friend to locate on the map.
                </p>
              </div>

              <FriendsListForMap />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function FriendsListForMap() {
  const { data: users, isLoading } = useGetUsersQuery();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusedId = searchParams.get("focus");
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  if (isLoading)
    return <div className="p-4 text-gray-500">Loading friends...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {users?.map((u) => {
        const isMe = u._id === currentUser?._id;
        const isSelected = focusedId === u._id;
        const hasLocation = !!u.lastLocation;

        return (
          <button
            key={u._id}
            onClick={() => {
              if (hasLocation) {
                navigate(`/map?focus=${u._id}`);
              } else {
                toast.error("No location shared");
              }
            }}
            className={cn(
              "w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all border",
              isSelected
                ? "bg-white/10 border-white/10 shadow-lg text-white"
                : "hover:bg-white/5 border-transparent text-gray-300",
              !hasLocation && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="relative">
              <Avatar
                src={u.avatarUrl}
                name={u.displayName}
                size="sm"
                className="w-9 h-9"
              />
              {isMe && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e1e]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">
                {u.displayName} {isMe && "(You)"}
              </p>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                {hasLocation ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)]" />
                    {new Date(u.lastLocation!.updatedAt).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </>
                ) : (
                  "Location hidden"
                )}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
