import { io, Socket } from "socket.io-client";
import mongoose from "mongoose";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { setupSocketHandlers, initializeSequences } from "../socket/handlers";
import authRoutes from "../routes/auth";

import dotenv from "dotenv";

dotenv.config();

const PORT = 3002;
const SERVER_URL = `http://localhost:${PORT}`;
const TEST_ROOM_NAME = "recovery-test-room";

// --- Server Setup ---
const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: "*", // Allow all for test
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const ioServer = new Server(httpServer, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
});

app.use("/auth", authRoutes);

function startTestServer() {
  return new Promise<void>((resolve) => {
    setupSocketHandlers(ioServer);
    initializeSequences();

    httpServer.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      resolve();
    });
  });
}

// --- Test Logic ---

async function setupData() {
  // Create test user 1
  let user1 = await User.findOne({ email: "test1@example.com" });
  if (!user1) {
    user1 = await User.create({
      email: "test1@example.com",
      passwordHash: "hashedpassword123",
      displayName: "Test User 1",
    });
  }

  // Create test user 2
  let user2 = await User.findOne({ email: "test2@example.com" });
  if (!user2) {
    user2 = await User.create({
      email: "test2@example.com",
      passwordHash: "hashedpassword123",
      displayName: "Test User 2",
    });
  }

  // Create test room
  let room = await Room.findOne({ name: TEST_ROOM_NAME });
  if (!room) {
    room = await Room.create({
      name: TEST_ROOM_NAME,
      slug: "recovery-test-room",
      description: "Test room for recovery",
      createdBy: user1._id,
      tags: ["test"],
    });
  }

  // Generate tokens
  const { generateAccessToken } = await import("../utils/jwt");
  const token1 = generateAccessToken({
    userId: user1._id.toString(),
    email: user1.email,
  });
  const token2 = generateAccessToken({
    userId: user2._id.toString(),
    email: user2.email,
  });

  return { token1, token2, roomId: room._id.toString() };
}

function createClient(token: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      forceNew: true,
    });

    socket.on("connect", () => {
      socket.emit("auth:identify", { token });
    });

    socket.on("auth:ok", () => {
      resolve(socket);
    });

    socket.on("auth:error", (err) => {
      reject(new Error(`Auth failed: ${err.message}`));
    });

    socket.on("connect_error", (err) => {
      reject(err);
    });
  });
}

async function runTest() {
  await startTestServer();
  console.log("Server started.");

  console.log("Setting up test data...");
  const { token1, token2, roomId } = await setupData();
  console.log("Test data ready.");

  // 1. Connect Client A
  console.log("Connecting Client A...");
  const clientA = await createClient(token1);

  // 2. Connect Client B
  console.log("Connecting Client B...");
  const clientB = await createClient(token2);

  // 3. Join Room
  console.log("Joining room...");
  clientA.emit("room:join", { roomId });
  clientB.emit("room:join", { roomId });

  await new Promise((resolve) => setTimeout(resolve, 500));

  // 4. Capture Client A's last seen sequence
  let lastSeqA = 0;
  clientA.on("message:new", (data) => {
    lastSeqA = data.seq;
    console.log(`Client A received message seq: ${data.seq}`);
  });

  // Send one initial message
  console.log("Sending initial message...");
  clientB.emit("message:send", {
    roomId,
    text: "Initial message",
    tempId: "init",
  });
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(`Client A last seen seq: ${lastSeqA}`);

  // 5. Disconnect Client A
  console.log("Disconnecting Client A...");
  clientA.disconnect();

  // 6. Client B sends 3 messages
  console.log("Client B sending 3 messages...");
  for (let i = 1; i <= 3; i++) {
    clientB.emit("message:send", {
      roomId,
      text: `Missed message ${i}`,
      tempId: `missed-${i}`,
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 7. Reconnect Client A
  console.log("Reconnect Client A...");
  const clientAReconnected = await createClient(token1);

  // 8. Client A joins and requests recovery
  console.log(`Client A requesting recovery from seq ${lastSeqA}...`);

  return new Promise<void>((resolve, reject) => {
    clientAReconnected.on("connection:missed", (data) => {
      console.log("Received connection:missed event:", data);
      if (data.messages.length === 3) {
        console.log("✅ SUCCESS: Recovered 3 missed messages!");
        resolve();
      } else {
        console.error(
          `❌ FAILED: Expected 3 messages, got ${data.messages.length}`
        );
        reject(new Error("Recovery failed"));
      }
      cleanup();
    });

    // Timeout
    setTimeout(() => {
      console.error("❌ FAILED: Timeout waiting for recovery event");
      cleanup();
      process.exit(1);
    }, 5000);

    clientAReconnected.emit("room:join", { roomId });
    clientAReconnected.emit("connection:recover", {
      roomId,
      lastSeenSeq: lastSeqA,
    });

    function cleanup() {
      clientAReconnected.disconnect();
      clientB.disconnect();
      mongoose.disconnect();
      httpServer.close();
    }
  });
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
