// User types
export interface User {
  _id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;

  lastLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  connectionId?: string;
  createdAt: string;
  profileColor?: string;
}

// Room types
export interface Room {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  tags: string[];
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// Message types
export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  text: string;
  type?: "text" | "location";
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  seq: number;
  isMine: boolean;
  isOptimistic?: boolean;
  isSystemMessage?: boolean;
  parentId?: string;
  replyCount?: number;
}

// Conversation types
export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: UIMessage;
  lastMessageAt?: string;
  type: "dm" | "room";
  roomId?: string;
  status: "pending" | "accepted" | "rejected";
  initiatorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UIMessage {
  id: string;
  roomId?: string;
  conversationId?: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  text: string;
  type: "text" | "location";
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  isMine: boolean;
  isOptimistic?: boolean;
  isSystemMessage?: boolean;
  parentId?: string;
  replyCount?: number;
}

// Socket event types
export interface SocketMessageSend {
  roomId: string;
  text: string;
  tempId: string;
  clientLastEventId?: number;
}

export interface SocketMessageNew {
  message: UIMessage;
  seq: number;
}

export interface SocketRoomJoin {
  roomId: string;
}

export interface SocketTypingUpdate {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
