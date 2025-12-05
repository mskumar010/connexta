import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/connexta";
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}
 
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
  }
}
