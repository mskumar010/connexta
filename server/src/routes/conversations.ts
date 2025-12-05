import { Router } from "express";
import { Conversation } from "../models/Conversation";
import { User } from "../models/User";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// Get all conversations for the current user
router.get("/", authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId as any,
    })
      .populate("participants", "displayName avatarUrl email")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    return res.json(conversations);
  } catch (error) {
    return next(error);
  }
});

// Create or Get conversation (DM)
router.post("/", authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { targetConnectionId } = req.body;

    if (!targetConnectionId) {
      throw new AppError("Target Connection ID is required", 400);
    }

    // Find user by connectionId
    const targetUser = await User.findOne({
      connectionId: targetConnectionId.toLowerCase(),
    });
    if (!targetUser) {
      throw new AppError("User not found with this Connection ID", 404);
    }

    if (targetUser._id.toString() === req.userId) {
      throw new AppError("You cannot connect with yourself", 400);
    }

    const participantId = targetUser._id.toString();

    // Sort participants to ensure uniqueness
    const participants = [req.userId, participantId].sort();

    // Check if DM already exists
    let conversation = await Conversation.findOne({
      type: "dm",
      participants: { $all: participants, $size: 2 },
    })
      .populate("participants", "displayName avatarUrl email connectionId")
      .populate("lastMessage");

    if (conversation) {
      return res.json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      type: "dm",
      participants: participants,
      lastMessageAt: new Date(),
      status: "pending", // Keep pending status for now
      initiatorId: req.userId,
    });

    await conversation.save();

    // Add conversation to users' lists
    await User.updateMany(
      { _id: { $in: participants as any[] } },
      { $push: { conversations: conversation._id } }
    );

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "displayName avatarUrl email connectionId")
      .populate("lastMessage");

    // Socket Notification for Recipient
    const io = req.app.get("io");
    if (io) {
      const sockets = await io.fetchSockets();
      // Look in socket.data.userId
      const targetSocket = sockets.find(
        (s: any) => s.data.userId === participantId
      );

      if (targetSocket) {
        targetSocket.emit("conversation:new_request", populatedConversation);
      }
    }

    return res.status(201).json(populatedConversation);
  } catch (error) {
    return next(error);
  }
});

// Accept Connection
router.post(
  "/:id/accept",
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.userId,
      });

      if (!conversation) throw new AppError("Conversation not found", 404);

      // Only recipient can accept
      if (
        conversation.initiatorId &&
        conversation.initiatorId.toString() === req.userId
      ) {
        throw new AppError("You cannot accept your own request", 400);
      }

      conversation.status = "accepted";
      await conversation.save();

      // Notify Initiator about acceptance
      const io = req.app.get("io");
      if (io) {
        const initiatorId = conversation.initiatorId?.toString();
        if (initiatorId) {
          const sockets = await io.fetchSockets();
          const targetSocket = sockets.find(
            (s: any) => s.data.userId === initiatorId
          );

          // We need to send the updated conversation
          const updatedConv = await Conversation.findById(conversation._id)
            .populate(
              "participants",
              "displayName avatarUrl email connectionId"
            )
            .populate("lastMessage");

          if (targetSocket) {
            targetSocket.emit("conversation:accepted", updatedConv);
          }
        }
      }

      return res.json(conversation);
    } catch (error) {
      return next(error);
    }
  }
);

// Reject Connection
router.post(
  "/:id/reject",
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.userId,
      });

      if (!conversation) throw new AppError("Conversation not found", 404);

      conversation.status = "rejected";
      await conversation.save();

      return res.json(conversation);
    } catch (error) {
      return next(error);
    }
  }
);

// Get a specific conversation
router.get("/:id", authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.userId,
    })
      .populate("participants", "displayName avatarUrl email")
      .populate("lastMessage");

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    return res.json(conversation);
  } catch (error) {
    return next(error);
  }
});

// Delete conversation (Disconnect)
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.userId,
      });

      if (!conversation) {
        throw new AppError("Conversation not found", 404);
      }

      // ... existing delete logic ...
      await User.findByIdAndUpdate(req.userId, {
        $pull: { conversations: conversation._id },
      });

      return res.json({ message: "Disconnected successfully" });
    } catch (error) {
      return next(error);
    }
  }
);

// Create or Get conversation (DM)
router.post("/", authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { targetConnectionId } = req.body;

    if (!targetConnectionId) {
      throw new AppError("Target Connection ID is required", 400);
    }

    // Find user by connectionId
    const targetUser = await User.findOne({
      connectionId: targetConnectionId.toLowerCase(),
    });
    if (!targetUser) {
      throw new AppError("User not found with this Connection ID", 404);
    }

    if (targetUser._id.toString() === req.userId) {
      throw new AppError("You cannot connect with yourself", 400);
    }

    const participantId = targetUser._id.toString();

    // Sort participants to ensure uniqueness
    const participants = [req.userId, participantId].sort();

    // Check if DM already exists
    let conversation = await Conversation.findOne({
      type: "dm",
      participants: { $all: participants, $size: 2 },
    })
      .populate("participants", "displayName avatarUrl email connectionId")
      .populate("lastMessage");

    if (conversation) {
      return res.json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      type: "dm",
      participants: participants,
      lastMessageAt: new Date(),
      status: "pending", // Keep pending status for now
      initiatorId: req.userId,
    });

    await conversation.save();

    // Add conversation to users' lists
    await User.updateMany(
      { _id: { $in: participants as any[] } },
      { $push: { conversations: conversation._id } }
    );

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "displayName avatarUrl email connectionId")
      .populate("lastMessage");

    // Socket Notification for Recipient
    const io = req.app.get("io");
    if (io) {
      const sockets = await io.fetchSockets();
      // Look in socket.data.userId
      const targetSocket = sockets.find(
        (s: any) => s.data.userId === participantId
      );

      if (targetSocket) {
        targetSocket.emit("conversation:new_request", populatedConversation);
      }
    }

    return res.status(201).json(populatedConversation);
  } catch (error) {
    return next(error);
  }
});

// Accept Connection
router.post(
  "/:id/accept",
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.userId,
      });

      if (!conversation) throw new AppError("Conversation not found", 404);

      // Only recipient can accept
      if (
        conversation.initiatorId &&
        conversation.initiatorId.toString() === req.userId
      ) {
        throw new AppError("You cannot accept your own request", 400);
      }

      conversation.status = "accepted";
      await conversation.save();

      // Notify Initiator about acceptance
      const io = req.app.get("io");
      if (io) {
        const initiatorId = conversation.initiatorId?.toString();
        if (initiatorId) {
          const sockets = await io.fetchSockets();
          const targetSocket = sockets.find(
            (s: any) => s.data.userId === initiatorId
          );

          // We need to send the updated conversation
          const updatedConv = await Conversation.findById(conversation._id)
            .populate(
              "participants",
              "displayName avatarUrl email connectionId"
            )
            .populate("lastMessage");

          if (targetSocket) {
            targetSocket.emit("conversation:accepted", updatedConv);
          }
        }
      }

      return res.json(conversation);
    } catch (error) {
      return next(error);
    }
  }
);

// Reject Connection
router.post(
  "/:id/reject",
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.userId,
      });

      if (!conversation) throw new AppError("Conversation not found", 404);

      conversation.status = "rejected";
      await conversation.save();

      return res.json(conversation);
    } catch (error) {
      return next(error);
    }
  }
);

// Get a specific conversation
router.get("/:id", authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.userId,
    })
      .populate("participants", "displayName avatarUrl email")
      .populate("lastMessage");

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    return res.json(conversation);
  } catch (error) {
    return next(error);
  }
});

// Delete conversation (Disconnect)
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.userId,
      });

      if (!conversation) {
        throw new AppError("Conversation not found", 404);
      }

      // Capture participants for socket notification before deleting
      // const participantIds = conversation.participants.map(p => p.toString());

      // SOFT DELETE: Only remove from the REQUESTING user's list
      await User.findByIdAndUpdate(req.userId, {
        $pull: { conversations: conversation._id },
      });

      // Notify ONLY the requesting user via socket so their UI updates
      const io = req.app.get("io");
      if (io) {
        const sockets = await io.fetchSockets();
        const socket = sockets.find((s: any) => s.data.userId === req.userId);
        if (socket) {
          socket.emit("conversation:deleted", {
            conversationId: conversation._id,
          });
        }
      }

      return res.json({ message: "Disconnected successfully" });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
