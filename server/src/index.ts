import dotenv from "dotenv";
// Load environment variables immediately
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/database";
import { setupSocketHandlers, initializeSequences } from "./socket/handlers";
import authRoutes from "./routes/auth";
import roomsRoutes from "./routes/rooms";
import roomsRoutes from "./routes/rooms";
import messagesRoutes from "./routes/messages";
import conversationRoutes from "./routes/conversations";
import { errorHandler } from "./middleware/errorHandler";
import { seedRooms } from "./scripts/seedRooms";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Socket.IO setup
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/auth", authRoutes);
app.use("/rooms", roomsRoutes);
app.use("/rooms", roomsRoutes);
app.use("/conversations", conversationRoutes);
app.use("/rooms/:roomId/messages", messagesRoutes); // Keep for backward compatibility
app.use("/conversations/:conversationId/messages", messagesRoutes); // New route for DMs

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize sequence numbers
    await initializeSequences();

    // Seed default rooms
    await seedRooms();

    // Setup Socket.IO handlers
    setupSocketHandlers(io);

    // Start server
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
