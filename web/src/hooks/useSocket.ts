import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { RootState, AppDispatch } from "@/app/store";
import { authApi } from "@/api/authApi";
import {
  setStatus,
  setError,
  setLastEventId,
} from "@/features/connection/connectionSlice";
import type { SocketMessageNew, SocketTypingUpdate } from "@/types";

export function useSocket() {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    if (!accessToken) {
      // Disconnect if no token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      dispatch(setStatus("disconnected"));
      return;
    }

    dispatch(setStatus("connecting"));
    const socket = getSocket(accessToken);
    socketRef.current = socket;

    // Authenticate on connection
    const onConnect = () => {
      console.log("Socket connected:", socket.id);
      socket.emit("auth:identify", { token: accessToken });
    };

    const onAuthOk = () => {
      console.log("Socket authenticated");
      dispatch(setStatus("connected"));
      if (socket.id) {
        dispatch(setLastEventId(socket.id));
      }
    };

    const onAuthError = async (error: unknown) => {
      console.error("Socket auth error:", error);
      try {
        await dispatch(
          authApi.endpoints.refresh.initiate({
            refreshToken: refreshToken || undefined,
          })
        ).unwrap();
      } catch (refreshError) {
        console.error("Socket token refresh failed:", refreshError);
        dispatch(setError("Authentication failed"));
        dispatch(setStatus("error"));
      }
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
      dispatch(setStatus("disconnected"));
    };

    const onConnectError = (error: unknown) => {
      console.error("Socket connection error:", error);
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Connection failed";
      dispatch(setError(errorMessage));
      dispatch(setStatus("error"));
    };

    const onReconnect = () => {
      console.log("Socket reconnected");
      if (accessToken) {
        socket.emit("auth:identify", { token: accessToken });
      }
    };

    const onReconnectAttempt = () => {
      dispatch(setStatus("reconnecting"));
    };

    socket.on("connect", onConnect);
    socket.on("auth:ok", onAuthOk);
    socket.on("auth:error", onAuthError);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect", onReconnect);
    socket.on("reconnect_attempt", onReconnectAttempt);

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("auth:ok", onAuthOk);
      socket.off("auth:error", onAuthError);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect", onReconnect);
      socket.off("reconnect_attempt", onReconnectAttempt);
    };
  }, [accessToken, dispatch, refreshToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!accessToken) {
        disconnectSocket();
      }
    };
  }, [accessToken]);

  return socketRef.current;
}
