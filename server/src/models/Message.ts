import mongoose, { Schema } from "mongoose";

export interface IMessage {
  _id: string;
  _id: string;
  conversationId: string; // Conversation ID
  roomId?: string; // Optional, kept for backward compatibility or room-specific logic
  senderId: string; // User ID
  text: string;
  seq: number; // Sequential number for recovery
  isSystemMessage?: boolean;
  parentId?: string;
  replyCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    } as any,
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      index: true,
    } as any,
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    } as any,
    text: {
      type: String,
      required: true,
      trim: true,
    },
    seq: {
      type: Number,
      required: true,
      index: true,
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      index: true,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
messageSchema.index({ conversationId: 1, seq: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
