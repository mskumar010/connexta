import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import { addMessage, setTypingUser } from "@/features/chat/chatSlice";
import {
  updateConversation,
  addConversation,
} from "@/features/conversations/conversationsSlice";
import type { UIMessage, Conversation } from "@/types";

export const useConversationSocket = () => {
  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (message: UIMessage) => {
      if (message.conversationId) {
        dispatch(addMessage({ roomId: message.conversationId, message }));
        dispatch(
          updateConversation({
            conversationId: message.conversationId,
            lastMessage: message,
            lastMessageAt: message.createdAt,
          })
        );
      }
    };

    const handleConversationCreated = (conversation: Conversation) => {
      dispatch(addConversation(conversation));
    };

    const handleConversationUpdated = (data: {
      conversationId: string;
      lastMessage: UIMessage;
      lastMessageAt: string;
    }) => {
      dispatch(updateConversation(data));
    };

    const handleTyping = (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      dispatch(
        setTypingUser({
          roomId: data.conversationId,
          userId: data.userId,
          isTyping: data.isTyping,
        })
      );
    };

    socket.on("message:dm:received", handleMessageReceived);
    socket.on("conversation:created", handleConversationCreated);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("conversation:typing", handleTyping);

    return () => {
      socket.off("message:dm:received", handleMessageReceived);
      socket.off("conversation:created", handleConversationCreated);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("conversation:typing", handleTyping);
    };
  }, [dispatch, socket]);
};
