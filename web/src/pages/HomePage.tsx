import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ChatArea } from "@/components/layout/ChatArea";
import type { RootState } from "@/app/store";

export function HomePage() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to chat by default or show welcome screen
  return (
    <ChatArea
      header={
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Home
          </span>
        </div>
      }
    >
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Welcome to Connexta
          </h2>
          <p style={{ color: "var(--color-text-tertiary)" }}>
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    </ChatArea>
  );
}
