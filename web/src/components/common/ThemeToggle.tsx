import { Moon, Sun, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme();

  const themes: Array<{
    value: "light" | "dark" | "system";
    icon: typeof Sun;
    label: string;
  }> = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div
      className="flex items-center gap-1 rounded-lg p-1"
      style={{ backgroundColor: "var(--color-bg-secondary)" }}
    >
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <motion.button
            key={value}
            onClick={() => setTheme(value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: isActive
                ? "var(--color-bg-tertiary)"
                : "transparent",
              color: isActive
                ? "var(--color-text-primary)"
                : "var(--color-text-tertiary)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor =
                  "var(--color-bg-tertiary)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--color-text-tertiary)";
              }
            }}
            title={label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact version for header/sidebar (Switch Style)
export function ThemeToggleCompact() {
  const { actualTheme, toggleTheme } = useTheme();
  const isDark = actualTheme === "dark";

  return (
    <div
      onClick={toggleTheme}
      className={cn(
        "relative w-7 h-14 rounded-full cursor-pointer transition-colors shadow-inner border border-white/5",
        isDark ? "bg-[var(--color-bg-tertiary)]" : "bg-gray-300"
      )}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Icons Background (Vertical Stack) */}
      <div className="absolute inset-x-0 inset-y-1 flex flex-col items-center justify-between py-1 pointer-events-none">
        <Sun
          size={12}
          className={cn(
            "text-yellow-600 transition-opacity",
            isDark ? "opacity-0" : "opacity-100"
          )}
        />
        <Moon
          size={12}
          className={cn(
            "text-white transition-opacity",
            isDark ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Thumb (Vertical Movement: y: 0 -> 28) */}
      <motion.div
        layout
        initial={false}
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center z-10"
        animate={{ y: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-yellow-500" />
        )}
      </motion.div>
    </div>
  );
}
