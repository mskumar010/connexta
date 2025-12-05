import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UIMessage, SocketMessageNew } from "@/types";
import { generateTempId } from "@/lib/utils";

interface ChatState {
  messages: {
    [roomId: string]: UIMessage[];
  };
  typingUsers: {
    [roomId: string]: string[];
  };
  onlineUsers: {
    [roomId: string]: string[];
  };
  userCounts: {
    [roomId: string]: number;
  };
}

const initialState: ChatState = {
  messages: {},
  typingUsers: {},
  onlineUsers: {},
  userCounts: {},
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // ... existing reducers ...
    setUserCount: (
      state,
      action: PayloadAction<{ roomId: string; count: number }>
    ) => {
      const { roomId, count } = action.payload;
      state.userCounts[roomId] = count;
    },
    addMessage: (
      state,
      action: PayloadAction<{ roomId: string; message: UIMessage }>
    ) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      // Avoid duplicates
      if (!state.messages[roomId].find((m) => m.id === message.id)) {
        state.messages[roomId].push(message);
      }
    },
    addMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: UIMessage[] }>
    ) => {
      const { roomId, messages } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId] = [
        ...state.messages[roomId],
        ...messages.filter(
          (msg) => !state.messages[roomId].find((m) => m.id === msg.id)
        ),
      ].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    },
    setMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: UIMessage[] }>
    ) => {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = messages;
    },
    updateOptimisticMessage: (
      state,
      action: PayloadAction<{
        roomId: string;
        tempId: string;
        realId: string;
      }>
    ) => {
      const { roomId, tempId, realId } = action.payload;
      const messages = state.messages[roomId];
      if (messages) {
        const index = messages.findIndex((m) => m.id === tempId);
        if (index !== -1) {
          messages[index].id = realId;
          messages[index].isOptimistic = false;
        }
      }
    },
    setTypingUser: (
      state,
      action: PayloadAction<{
        roomId: string;
        userId: string;
        isTyping: boolean;
      }>
    ) => {
      const { roomId, userId, isTyping } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      if (isTyping) {
        if (!state.typingUsers[roomId].includes(userId)) {
          state.typingUsers[roomId].push(userId);
        }
      } else {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(
          (id) => id !== userId
        );
      }
    },
    setOnlineUsers: (
      state,
      action: PayloadAction<{ roomId: string; userIds: string[] }>
    ) => {
      const { roomId, userIds } = action.payload;
      state.onlineUsers[roomId] = userIds;
    },
    clearRoom: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      delete state.messages[roomId];
      delete state.typingUsers[roomId];
      delete state.onlineUsers[roomId];
    },
  },
});

export const {
  addMessage,
  addMessages,
  setMessages,
  updateOptimisticMessage,
  setTypingUser,
  setOnlineUsers,
  setUserCount,
  clearRoom,
} = chatSlice.actions;

export default chatSlice.reducer;
