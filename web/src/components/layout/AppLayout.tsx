import { Outlet, useLocation, matchPath } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const location = useLocation();

  // Check if we are viewing a specific conversation (DM, Room, or Profile sometimes?)
  const isChatOpen =
    matchPath("/chat/:conversationId", location.pathname) ||
    matchPath("/room/:roomId", location.pathname) ||
    matchPath("/map", location.pathname); // Map treats differently? Maybe map is full screen on mobile?

  // On Mobile:
  // - If Chat/Room is open, HIDE Sidebar, SHOW Main.
  // - If NO Chat open (root), SHOW Sidebar, HIDE Main.

  // On Desktop (md+):
  // - Always SHOW both.

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
        {/* Sidebar Container:
            - Mobile: Hidden if chat is open. Visible if chat is closed.
            - Desktop: Always visible.
        */}
        <div
          className={cn(
            "h-full z-20 md:flex flex-shrink-0 transition-transform duration-300",
            // Mobile Logic
            isChatOpen ? "hidden md:flex" : "flex w-full md:w-auto"
          )}
        >
          <Sidebar />
        </div>

        {/* Main Content Container:
            - Mobile: Visible if chat is open. Hidden if chat is closed.
            - Desktop: Always visible (flex-1).
        */}
        <main
          className={cn(
            "flex-1 flex-col overflow-hidden relative z-10",
            // Mobile Logic
            // If NO Chat Open (Root) -> Hide Main (on mobile), Wait.. index matches / so Outlet renders something?
            // Actually if path is /, Outlet renders EmptyState. We probably want to hide that on mobile.
            !isChatOpen ? "hidden md:flex" : "flex w-full"
          )}
        >
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "white",
            },
          },
        }}
      />
    </>
  );
}
