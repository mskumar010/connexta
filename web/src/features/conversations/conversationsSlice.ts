import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Conversation, UIMessage } from "@/types";

interface ConversationsState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  unreadCounts: { [conversationId: string]: number };
}

const initialState: ConversationsState = {
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  unreadCounts: {},
};

export const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      if (!state.conversations.find((c) => c._id === action.payload._id)) {
        state.conversations.unshift(action.payload);
      }
    },
    updateConversation: (
      state,
      action: PayloadAction<{
        conversationId: string;
        lastMessage: UIMessage;
        lastMessageAt: string;
      }>
    ) => {
      const { conversationId, lastMessage, lastMessageAt } = action.payload;
      const index = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (index !== -1) {
        const conversation = state.conversations[index];
        conversation.lastMessage = lastMessage;
        conversation.lastMessageAt = lastMessageAt;
        // Move to top
        state.conversations.splice(index, 1);
        state.conversations.unshift(conversation);
      }
    },
    updateConversationStatus: (
      state,
      action: PayloadAction<{
        conversationId: string;
        status: string;
        conversation: Conversation;
      }>
    ) => {
      const { conversationId, conversation } = action.payload;
      const index = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (index !== -1) {
        state.conversations[index] = conversation;
      } else {
        // If not found, add it
        state.conversations.unshift(conversation);
      }
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      if (action.payload) {
        state.unreadCounts[action.payload] = 0;
      }
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      if (state.activeConversationId !== conversationId) {
        state.unreadCounts[conversationId] =
          (state.unreadCounts[conversationId] || 0) + 1;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setConversations,
  addConversation,
  updateConversation,
  updateConversationStatus,
  setActiveConversation,
  incrementUnreadCount,
  setLoading,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;
