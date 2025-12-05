import { Home, Hash, Plus, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useGetRoomsQuery } from "@/api/roomsApi";
import { useLogoutMutation } from "@/api/authApi";
import { cn } from "@/lib/utils";
import { setActiveRoom } from "@/features/rooms/roomsSlice";
import { logout } from "@/features/auth/authSlice";
import { useState } from "react";
import { ConversationList } from "@/features/conversations/ConversationList";
import { NewChatModal } from "@/features/conversations/NewChatModal";
import { Compass, MessageSquarePlus } from "lucide-react";
import type { RootState } from "@/app/store";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeRoomId, rooms: roomsFromState } = useSelector(
    (state: RootState) => state.rooms
  );
  const [logoutMutation] = useLogoutMutation();
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery(
    undefined,
    {
      skip: !user, // Only fetch if user is authenticated
    }
  );
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  // Use API data if available, otherwise fall back to state
  const displayRooms =
    roomsData && roomsData.length > 0 ? roomsData : roomsFromState;
  const currentRoomId =
    activeRoomId || location.pathname.split("/room/")[1] || null;

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still logout locally
      dispatch(logout());
      navigate("/login");
    }
  };

  const handleRoomClick = (roomId: string) => {
    dispatch(setActiveRoom(roomId));
    navigate(`/room/${roomId}`);
  };

  const handleHomeClick = () => {
    dispatch(setActiveRoom(null));
    navigate("/");
  };

  return (
    <aside
      className="flex w-64 flex-col border-r"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Server/App Header */}
      <div
        className="flex h-14 items-center border-b px-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">ER</span>
          </div>
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            EchoRoom
          </h1>
        </div>
      </div>

      {/* Navigation */}
      {/* Conversation List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-2">
          <motion.button
            onClick={() => setIsNewChatOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="font-medium">New Chat</span>
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>

        {/* Discover Rooms Link */}
        <div className="p-2 border-t border-gray-800">
          <motion.button
            onClick={() => navigate("/rooms")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors text-gray-400 hover:bg-gray-800 hover:text-gray-100"
          >
            <Compass className="h-5 w-5" />
            <span className="font-medium">Discover Rooms</span>
          </motion.button>
        </div>
      </div>

      {/* User Section */}
      <div
        className="border-t p-2 space-y-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.displayName?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {user?.displayName || "User"}
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Online
            </p>
          </div>
          <Settings
            className="h-4 w-4 cursor-pointer hover:text-indigo-500 transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
            onClick={(e) => {
              e.stopPropagation();
              navigate("/profile");
            }}
          />
        </motion.button>
        <div className="flex items-center justify-between gap-2">
          <ThemeToggleCompact />
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-2 transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
            title="Logout"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-bg-tertiary)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-text-tertiary)";
            }}
          >
            <LogOut className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
    </aside>
  );
}
