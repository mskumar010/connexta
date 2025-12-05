import { MessageCircle, DoorOpen, Map, LogOut, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { useLogoutMutation } from "@/api/authApi";
import { logout } from "@/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { ThemeToggleCompact } from "@/components/common/ThemeToggle";

interface NavigationRailProps {
  activeTab: "chats" | "rooms" | "map";
  onTabChange: (tab: "chats" | "rooms" | "map") => void;
}

export function NavigationRail({
  activeTab,
  onTabChange,
}: NavigationRailProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      navigate("/login");
    }
  };

  const tabs = [
    { id: "chats", icon: MessageCircle, label: "Chats" },
    { id: "rooms", icon: DoorOpen, label: "Rooms" },
    { id: "map", icon: Map, label: "Map" },
  ] as const;

  return (
    <div className="flex flex-col items-center py-4 w-20 shrink-0 h-full justify-between backdrop-blur-xl border-r border-white/5 bg-[var(--color-bg-secondary)]/80 z-20">
      {/* Top Tabs */}
      <div className="flex flex-col gap-6 items-center w-full mt-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-3.5 rounded-2xl transition-all relative group",
                isActive
                  ? "bg-[var(--color-brand-primary)] text-[var(--color-brand-accent)] shadow-md"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
              )}
              title={tab.label}
            >
              <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />

              {/* Active Indicator Line on Left */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-[var(--color-brand-accent)]"
                />
              )}

              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none border border-white/10 shadow-xl backdrop-blur-sm">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Section: User & Settings */}
      <div className="flex flex-col gap-6 items-center w-full pb-4">
        {/* Theme Toggle */}
        <div className="scale-75 origin-center">
          <ThemeToggleCompact />
        </div>

        <div className="w-10 h-px bg-white/10" />

        {/* User Avatar */}
        <div className="relative group">
          <button
            onClick={() => navigate("/profile")}
            className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
            title={`${user?.displayName} (@${user?.connectionId})`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-bg-secondary)] border-2 border-transparent">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold w-full h-full flex items-center justify-center bg-[var(--color-brand-primary)]">
                  {user?.displayName?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
          </button>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none border border-white/10 shadow-xl backdrop-blur-sm text-center min-w-[100px]">
            <span className="block font-bold text-[var(--color-brand-accent)] text-[11px] leading-tight">
              {user?.displayName}
            </span>
            <span className="block text-gray-400 text-[10px] mt-0.5 font-mono">
              @{user?.connectionId}
            </span>
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-[var(--color-brand-accent)] p-2.5 rounded-xl hover:bg-[var(--color-brand-primary)]/10 transition-colors"
          title="Logout"
        >
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}
