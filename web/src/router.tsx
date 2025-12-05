import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { ChatRoomPage } from "@/pages/ChatRoomPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

import { ProfilePage } from "@/pages/ProfilePage";
import { PublicProfilePage } from "@/pages/PublicProfilePage";
import { ConversationPage } from "@/pages/ConversationPage";
import { RoomsPage } from "@/pages/RoomsPage";
import { MapPage } from "@/features/map/MapPage";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "chat/:conversationId",
        element: <ConversationPage />,
      },
      {
        path: "room/:roomId",
        element: <ChatRoomPage />,
      },
      {
        path: "rooms",
        element: <RoomsPage />,
      },
      {
        path: "map",
        element: <MapPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/:userId",
        element: <PublicProfilePage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <ErrorBoundary />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
