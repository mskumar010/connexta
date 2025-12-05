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
      participants: req.userId,
    })
      .populate("participants", "displayName avatarUrl email")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

// Create a new conversation (or get existing DM)
router.post("/", authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      throw new AppError("Participant ID is required", 400);
    }

    // Check if DM already exists
    const existingConversation = await Conversation.findOne({
      type: "dm",
      participants: { $all: [req.userId, participantId] },
    })
      .populate("participants", "displayName avatarUrl email")
      .populate("lastMessage");

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Create new conversation
    const conversation = new Conversation({
      type: "dm",
      participants: [req.userId, participantId],
      lastMessageAt: new Date(),
    });

    await conversation.save();

    // Add conversation to users' lists
    await User.updateMany(
      { _id: { $in: [req.userId, participantId] } },
      { $push: { conversations: conversation._id } }
    );

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "displayName avatarUrl email")
      .populate("lastMessage");

    res.status(201).json(populatedConversation);
  } catch (error) {
    next(error);
  }
});

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

    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

export default router;
