import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  participants: string[]; // User IDs
  lastMessage?: string; // Message ID
  lastMessageAt?: Date;
  type: "dm" | "room";
  status: "pending" | "accepted" | "rejected";
  initiatorId?: string;
  roomId?: string; // If type is 'room'
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["dm", "room"],
      default: "dm",
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "accepted", // Default accepted for backward compatibility with Rooms/Old DMs
    },
    initiatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
