import { env } from "./config/env";
// Load environment variables immediately
// dotenv.config(); // Handled in env.ts

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/database";
import { setupSocketHandlers, initializeSequences } from "./socket/handlers";
import authRoutes from "./routes/auth";
import roomsRoutes from "./routes/rooms";
import messagesRoutes from "./routes/messages";
import conversationRoutes from "./routes/conversations";
import usersRoutes from "./routes/users";
import { errorHandler } from "./middleware/errorHandler";
import { seedRooms } from "./scripts/seedRooms";
import { seedUsers } from "./scripts/seedUsers";

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: env.CORS_ORIGIN,
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

// Make io accessible in routes
app.set("io", io);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/auth", authRoutes);
app.use("/rooms", roomsRoutes);
app.use("/conversations", conversationRoutes);
app.use("/users", usersRoutes);
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

    // Verify/Seed default users (X, Y, Z)
    await seedUsers();

    // Seed default rooms
    await seedRooms();

    // Setup Socket.IO handlers
    setupSocketHandlers(io);

    // Start server
    const PORT = env.PORT;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
