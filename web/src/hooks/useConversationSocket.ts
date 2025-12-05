import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import { addMessage, setTypingUser } from "@/features/chat/chatSlice";
import {
  updateConversation,
  addConversation,
  updateConversationStatus,
} from "@/features/conversations/conversationsSlice";
import type { UIMessage, Conversation } from "@/types";
import { conversationsApi } from "@/api/conversationsApi";

import type { AppDispatch } from "@/app/store";

export const useConversationSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
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
      // Update RTK Query Cache
      dispatch(
        conversationsApi.util.updateQueryData(
          "getConversations" as any,
          undefined,
          (draft: any) => {
            const exists = draft.find((c: any) => c._id === conversation._id);
            if (!exists) {
              draft.unshift(conversation);
            }
          }
        )
      );
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

    const handleConversationAccepted = (conversation: Conversation) => {
      dispatch(
        updateConversationStatus({
          conversationId: conversation._id,
          status: "accepted",
          conversation,
        })
      );

      // Update RTK Query Cache
      dispatch(
        conversationsApi.util.updateQueryData(
          "getConversations" as any,
          undefined,
          (draft: any) => {
            const index = draft.findIndex(
              (c: any) => c._id === conversation._id
            );
            if (index !== -1) {
              draft[index] = conversation;
            } else {
              draft.unshift(conversation);
            }
          }
        )
      );
    };

    socket.on("message:dm:received", handleMessageReceived);
    socket.on("conversation:created", handleConversationCreated);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("conversation:typing", handleTyping);
    socket.on("conversation:new_request", handleConversationCreated);
    socket.on("conversation:accepted", handleConversationAccepted);

    return () => {
      socket.off("message:dm:received", handleMessageReceived);
      socket.off("conversation:created", handleConversationCreated);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("conversation:typing", handleTyping);
      socket.off("conversation:new_request", handleConversationCreated);
      socket.off("conversation:accepted", handleConversationAccepted);
    };
  }, [dispatch, socket]);
};
