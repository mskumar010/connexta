import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import {
  addMessage,
  setTypingUser,
  setMessages,
  updateOptimisticMessage,
} from "@/features/chat/chatSlice";
import { useGetMessagesQuery } from "@/api/messagesApi";
import type { AppDispatch, RootState } from "@/app/store";
import type { UIMessage } from "@/types";

interface UseDmSocketOptions {
  conversationId: string;
  userId: string;
}

export function useDmSocket({ conversationId, userId }: UseDmSocketOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket();
  const conversationIdRef = useRef(conversationId);
  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch initial messages for this conversation
  const { data: initialMessages, isLoading } = useGetMessagesQuery(
    { roomId: conversationId, isDm: true },
    { skip: !conversationId }
  );

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Load initial messages into the store
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      const uiMessages = initialMessages.map((msg) => ({
        id: msg._id,
        roomId: (msg as any).conversationId || conversationId,
        sender: {
          id: msg.senderId,
          displayName: "User",
          avatarUrl: undefined,
        },
        text: msg.text,
        type: (msg.type as "text" | "location") || "text",
        createdAt: msg.createdAt,
        isMine: msg.senderId === userId,
        replyCount: msg.replyCount,
        parentId: msg.parentId,
      }));
      dispatch(setMessages({ roomId: conversationId, messages: uiMessages }));
    }
  }, [initialMessages, conversationId, userId, dispatch]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    // JOIN THE CONVERSATION ROOM
    socket.emit("conversation:join", { conversationId });

    const handleDmReceived = (data: any) => {
      // Ensure the message belongs to the current conversation
      // Check both conversationId (new) and roomId (if mapped)
      const incomingId = data.conversationId || (data as any).roomId;

      if (incomingId === conversationIdRef.current) {
        dispatch(
          addMessage({
            roomId: conversationIdRef.current,
            message: {
              ...data,
              roomId: conversationIdRef.current,
              isMine: data.sender.id === userId,
            },
          })
        );
      }
    };

    const handleDmTyping = (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (
        data.conversationId === conversationIdRef.current &&
        data.userId !== userId
      ) {
        dispatch(
          setTypingUser({
            roomId: conversationIdRef.current,
            userId: data.userId,
            isTyping: data.isTyping,
          })
        );
      }
    };

    const handleMessageAck = (data: { tempId: string; realId: string }) => {
      dispatch(
        updateOptimisticMessage({
          roomId: conversationIdRef.current,
          tempId: data.tempId,
          realId: data.realId,
        })
      );
    };

    socket.on("message:dm:received", handleDmReceived);
    socket.on("conversation:typing", handleDmTyping);
    socket.on("message:ack", handleMessageAck);

    return () => {
      socket.off("message:dm:received", handleDmReceived);
      socket.off("conversation:typing", handleDmTyping);
      socket.off("message:ack", handleMessageAck);
    };
  }, [socket, conversationId, userId, dispatch]);

  return { isLoading };
}
