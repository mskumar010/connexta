import { Router } from "express";
import { User } from "../models/User";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// Update user location
router.post(
  "/location",
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const { latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        throw new AppError("Latitude and longitude are required", 400);
      }

      const user = await User.findById(req.userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      user.lastLocation = {
        latitude,
        longitude,
        updatedAt: new Date(),
      };

      await user.save();

      return res.json({
        message: "Location updated",
        lastLocation: user.lastLocation,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Lookup user by connection ID (Public Profile)
router.get(
  "/lookup/:connectionId",
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const { connectionId } = req.params;
      const user = await User.findOne(
        { connectionId: connectionId.toLowerCase() },
        "displayName avatarUrl connectionId _id"
      );

      if (!user) {
        throw new AppError("User not found", 404);
      }

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  }
);

// Get all users (for map and discover)
router.get("/", authenticateToken, async (_req: AuthRequest, res, next) => {
  try {
    const users = await User.find(
      {},
      "displayName avatarUrl lastLocation hasCompletedOnboarding" // Projection
    ).limit(100); // safety limit

    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

export default router;
