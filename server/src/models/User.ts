import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  connectionId?: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string;
  conversations: string[]; // Conversation IDs
  hasCompletedOnboarding?: boolean;
  lastLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
  profileColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    connectionId: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true, // Allow nulls for legacy users initially
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    conversations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
      },
    ],
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
    lastLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
    profileColor: {
      type: String,
      default: "#0D7377", // Default brand primary
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
