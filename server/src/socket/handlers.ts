import type { Server } from "socket.io";
import { Message } from "../models/Message";
import { Room } from "../models/Room";
import { User } from "../models/User";

import { Conversation } from "../models/Conversation";
import type { AuthenticatedSocket } from "./auth";

// Track sequence numbers per room
const roomSequences = new Map<string, number>();

function getNextSeq(roomId: string): number {
  const current = roomSequences.get(roomId) || 0;
  const next = current + 1;
  roomSequences.set(roomId, next);
  return next;
}

// Initialize sequence from database on server start
export async function initializeSequences(): Promise<void> {
  const messages = await Message.find().sort({ seq: -1 });
  const sequences = new Map<string, number>();

  for (const msg of messages) {
    if (!msg.roomId) continue;
    const roomId = msg.roomId.toString();
    if (!sequences.has(roomId)) {
      sequences.set(roomId, msg.seq);
    }
  }

  roomSequences.clear();
  for (const [roomId, seq] of sequences) {
    roomSequences.set(roomId, seq);
  }
}

// Helper to resolve room ID from slug or ID
async function resolveRoomId(idOrSlug: string): Promise<string | null> {
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    return idOrSlug;
  }
  const room = await Room.findOne({ slug: idOrSlug });
  return room ? room._id.toString() : null;
}

export function setupSocketHandlers(io: Server): void {
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle authentication
    socket.on("auth:identify", async (data: { token: string }) => {
      try {
        const { verifyAccessToken } = await import("../utils/jwt");
        const payload = verifyAccessToken(data.token);
        socket.userId = payload.userId;
        socket.userEmail = payload.email;
        // Store in data for fetchSockets() access
        socket.data.userId = payload.userId;

        socket.emit("auth:ok", { userId: payload.userId });
        console.log(`Socket ${socket.id} authenticated as ${payload.userId}`);
      } catch (error) {
        socket.emit("auth:error", { message: "Authentication failed" });
        console.error(`Socket ${socket.id} auth failed:`, error);
      }
    });

    // Handle conversation joining
    socket.on("conversation:join", async (data: { conversationId: string }) => {
      try {
        if (!socket.userId) return;
        const { conversationId } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        if (conversation.participants.includes(socket.userId)) {
          socket.join(`conversation:${conversationId}`);
          console.log(
            `Socket ${socket.id} joined conversation: ${conversationId}`
          );
        } else {
          socket.emit("error", {
            message: "Not authorized to join this conversation",
          });
        }
      } catch (error) {
        console.error("Error joining conversation:", error);
      }
    });

    // Handle room joining
    socket.on("room:join", async (data: { roomId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        const roomId = await resolveRoomId(data.roomId);
        if (!roomId) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);

        // Get recent messages
        let recentMessages = await Message.find({ roomId })
          .populate("senderId", "displayName avatarUrl")
          .sort({ seq: -1 })
          .limit(50)
          .lean();

        // If no messages, populate with demo data
        if (recentMessages.length === 0) {
          try {
            const { populateRoomMessages } = await import("../utils/demoData");
            await populateRoomMessages(roomId);

            // Re-fetch messages
            recentMessages = await Message.find({ roomId })
              .populate("senderId", "displayName avatarUrl")
              .sort({ seq: -1 })
              .limit(50)
              .lean();
          } catch (error) {
            console.error(`Failed to populate room ${roomId}:`, error);
            // Continue with empty messages if population fails
          }
        }

        recentMessages.reverse();

        socket.emit("room:joined", {
          roomId,
          messages: recentMessages.map((msg) => {
            const sender = msg.senderId as any;
            return {
              id: msg._id.toString(),
              roomId: msg.roomId?.toString() ?? "",
              sender: {
                id:
                  typeof sender === "object" && sender._id
                    ? sender._id.toString()
                    : sender.toString(),
                displayName:
                  typeof sender === "object" && sender.displayName
                    ? sender.displayName
                    : "Unknown",
                avatarUrl:
                  typeof sender === "object" && sender.avatarUrl
                    ? sender.avatarUrl
                    : undefined,
              },
              text: msg.text,
              createdAt: msg.createdAt.toISOString(),
              isSystemMessage: msg.isSystemMessage,
              parentId: msg.parentId ? msg.parentId.toString() : undefined,
              replyCount: msg.replyCount,
            };
          }),
        });

        // Broadcast user count
        const roomSockets = await io.in(roomId).fetchSockets();
        io.to(roomId).emit("room:user_count", {
          roomId,
          count: roomSockets.length,
        });
      } catch (error) {
        console.error(`Error in room:join for socket ${socket.id}:`, error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Handle room leaving
    socket.on("room:leave", async (data: { roomId: string }) => {
      try {
        const roomId = await resolveRoomId(data.roomId);
        if (!roomId) return;

        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room: ${roomId}`);
        socket.emit("room:left", { roomId });

        // Broadcast user count
        const roomSockets = await io.in(roomId).fetchSockets();
        io.to(roomId).emit("room:user_count", {
          roomId,
          count: roomSockets.length,
        });
      } catch (error) {
        console.error(`Error in room:leave for socket ${socket.id}:`, error);
      }
    });

    // Handle message sending
    socket.on(
      "message:send",
      async (data: {
        roomId: string;
        text: string;
        tempId: string;
        parentId?: string;
      }) => {
        try {
          if (!socket.userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const roomId = await resolveRoomId(data.roomId);
          if (!roomId) {
            socket.emit("error", { message: "Room not found" });
            return;
          }

          const { text, tempId, parentId } = data;

          // Get user info
          const user = await User.findById(socket.userId);
          if (!user) {
            socket.emit("error", { message: "User not found" });
            return;
          }

          // If parentId is provided, validate parent message exists
          if (parentId) {
            const parentMessage = await Message.findById(parentId);
            if (!parentMessage) {
              socket.emit("error", { message: "Parent message not found" });
              return;
            }
            // Increment reply count
            parentMessage.replyCount = (parentMessage.replyCount || 0) + 1;
            await parentMessage.save();
          }

          // Create message
          const seq = getNextSeq(roomId);
          const message = new Message({
            roomId,
            senderId: socket.userId,
            text: text.trim(),
            seq,
            parentId: parentId || null,
          });

          await message.save();

          // Populate sender info
          await message.populate("senderId", "displayName avatarUrl");

          const messageData = {
            id: message._id.toString(),
            roomId: message.roomId!.toString(),
            sender: {
              id: user._id.toString(),
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            },
            text: message.text,
            createdAt: message.createdAt.toISOString(),
            isSystemMessage: message.isSystemMessage,
            parentId: message.parentId
              ? message.parentId.toString()
              : undefined,
            replyCount: message.replyCount,
          };

          // Broadcast to room
          io.to(roomId).emit("message:new", {
            message: messageData,
            seq,
          });

          // Acknowledge to sender
          socket.emit("message:ack", {
            tempId,
            realId: message._id.toString(),
          });
        } catch (error) {
          console.error(
            `Error in message:send for socket ${socket.id}:`,
            error
          );
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Handle typing indicators
    socket.on("typing:start", async (data: { roomId: string }) => {
      try {
        if (!socket.userId) return;
        const roomId = await resolveRoomId(data.roomId);
        if (!roomId) return;

        socket.to(roomId).emit("typing:update", {
          roomId,
          userId: socket.userId,
          isTyping: true,
        });
      } catch (error) {
        console.error(`Error in typing:start for socket ${socket.id}:`, error);
      }
    });

    socket.on("typing:stop", async (data: { roomId: string }) => {
      try {
        if (!socket.userId) return;
        const roomId = await resolveRoomId(data.roomId);
        if (!roomId) return;

        socket.to(roomId).emit("typing:update", {
          roomId,
          userId: socket.userId,
          isTyping: false,
        });
      } catch (error) {
        console.error(`Error in typing:stop for socket ${socket.id}:`, error);
      }
    });

    // Handle connection recovery
    socket.on(
      "connection:recover",
      async (data: { roomId: string; lastSeenSeq: number }) => {
        try {
          if (!socket.userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const roomId = await resolveRoomId(data.roomId);
          if (!roomId) return;

          const { lastSeenSeq } = data;

          // Find missed messages
          const missedMessages = await Message.find({
            roomId,
            seq: { $gt: lastSeenSeq },
          })
            .populate("senderId", "displayName avatarUrl")
            .sort({ seq: 1 })
            .lean();

          if (missedMessages.length > 0) {
            socket.emit("connection:missed", {
              roomId,
              messages: missedMessages.map((msg) => {
                const sender = msg.senderId as any;
                return {
                  id: msg._id.toString(),
                  roomId: msg.roomId?.toString() ?? "",
                  sender: {
                    id:
                      typeof sender === "object" && sender._id
                        ? sender._id.toString()
                        : sender.toString(),
                    displayName:
                      typeof sender === "object" && sender.displayName
                        ? sender.displayName
                        : "Unknown",
                    avatarUrl:
                      typeof sender === "object" && sender.avatarUrl
                        ? sender.avatarUrl
                        : undefined,
                  },
                  text: msg.text,
                  createdAt: msg.createdAt.toISOString(),
                  isSystemMessage: msg.isSystemMessage,
                  seq: msg.seq,
                  parentId: msg.parentId ? msg.parentId.toString() : undefined,
                  replyCount: msg.replyCount,
                };
              }),
              fromSeq: lastSeenSeq,
              toSeq: missedMessages[missedMessages.length - 1].seq,
            });
          }
        } catch (error) {
          console.error(
            `Error in connection:recover for socket ${socket.id}:`,
            error
          );
          socket.emit("error", {
            message: "Failed to recover connection state",
          });
        }
      }
    );

    // Handle conversation creation
    socket.on(
      "conversation:create",
      async (data: { participantId: string }) => {
        try {
          if (!socket.userId) return;
          const { participantId } = data;

          let conversation = await Conversation.findOne({
            type: "dm",
            participants: { $all: [socket.userId, participantId] },
          });

          if (!conversation) {
            conversation = new Conversation({
              type: "dm",
              participants: [socket.userId, participantId],
              lastMessageAt: new Date(),
            });
            await conversation.save();

            // Add to users' lists
            await User.updateMany(
              { _id: { $in: [socket.userId, participantId] } },
              { $push: { conversations: conversation._id } }
            );
          }

          const populatedConversation = await Conversation.findById(
            conversation._id
          )
            .populate("participants", "displayName avatarUrl email")
            .populate("lastMessage");

          // Notify both participants
          const participantSocket = (await io.fetchSockets()).find(
            (s: any) => s.data.userId === participantId
          );

          socket.emit("conversation:created", populatedConversation);
          if (participantSocket) {
            participantSocket.emit(
              "conversation:created",
              populatedConversation
            );
          }
        } catch (error) {
          console.error(`Error in conversation:create:`, error);
        }
      }
    );
    // Handle DM sending
    socket.on(
      "message:dm",
      async (data: {
        conversationId: string;
        text: string;
        tempId: string;
      }) => {
        try {
          if (!socket.userId) return;
          const { conversationId, text, tempId } = data;

          const conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            socket.emit("error", { message: "Conversation not found" });
            return;
          }

          // Verify participation
          if (!conversation.participants.includes(socket.userId)) {
            socket.emit("error", { message: "Not a participant" });
            return;
          }

          const message = new Message({
            conversationId,
            senderId: socket.userId,
            text: text.trim(),
            seq: Date.now(), // Simple seq for DMs
          });

          await message.save();
          await message.populate("senderId", "displayName avatarUrl");

          // Update conversation
          conversation.lastMessage = message._id as any;
          conversation.lastMessageAt = message.createdAt;
          await conversation.save();

          // RESURRECTION LOGIC: Ensure conversation is in both users' lists
          // If User A disconnected, this will add it back when User B messages
          const participants = conversation.participants;
          for (const pid of participants) {
            const result = await User.updateOne(
              { _id: pid, conversations: { $ne: conversation._id as any } },
              { $push: { conversations: conversation._id } }
            );

            // If we added it back, notify the user so it appears in sidebar immediately
            if (result.modifiedCount > 0) {
              const populatedConv = await Conversation.findById(
                conversation._id
              )
                .populate(
                  "participants",
                  "displayName avatarUrl email connectionId"
                )
                .populate("lastMessage");

              const targetSocket = (await io.fetchSockets()).find(
                (s: any) => s.data.userId === pid.toString()
              );
              if (targetSocket) {
                targetSocket.emit("conversation:new_request", populatedConv);
              }
            }
          }

          const messageData = {
            id: message._id.toString(),
            conversationId: message.conversationId.toString(),
            sender: {
              id: (message.senderId as any)._id.toString(),
              displayName: (message.senderId as any).displayName,
              avatarUrl: (message.senderId as any).avatarUrl,
            },
            text: message.text,
            createdAt: message.createdAt.toISOString(),
          };
          // Emit to the conversation room (exclude sender)
          socket
            .to(`conversation:${conversationId}`)
            .emit("message:dm:received", messageData);

          // Also emit conversation update to the room so lists update (exclude sender if possible, or handle on client)
          // Actually, conversation:updated might be useful for sender too if it carries "lastMessage" data that settles the conversation state?
          // But sender optimistically updates. Let's exclude sender to avoid double-update flicker.
          socket
            .to(`conversation:${conversationId}`)
            .emit("conversation:updated", {
              conversationId,
              lastMessage: messageData,
              lastMessageAt: message.createdAt,
            });

          // Ack to sender
          socket.emit("message:ack", {
            tempId,
            realId: message._id.toString(),
          });
        } catch (error) {
          console.error(`Error in message:dm:`, error);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Handle DM typing
    socket.on(
      "conversation:typing",
      async (data: { conversationId: string; isTyping: boolean }) => {
        try {
          if (!socket.userId) return;
          const { conversationId, isTyping } = data;

          const conversation = await Conversation.findById(conversationId);
          if (!conversation) return;

          conversation.participants.forEach(async (participantId) => {
            if (participantId !== socket.userId) {
              const sockets = await io.fetchSockets();
              const participantSocket = sockets.find(
                (s: any) => s.data.userId === participantId
              );
              if (participantSocket) {
                participantSocket.emit("conversation:typing", {
                  conversationId,
                  userId: socket.userId,
                  isTyping,
                });
              }
            }
          });
        } catch (error) {
          console.error(`Error in conversation:typing:`, error);
        }
      }
    );

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
