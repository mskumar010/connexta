import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Register
router.post('/register', async (req, res, next) => {
	try {
		const { email, password, displayName } = req.body;

		if (!email || !password || !displayName) {
			throw new AppError('Email, password, and display name are required', 400);
		}

		// Check if user exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			throw new AppError('User with this email already exists', 409);
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 10);

		// Create user
		const user = new User({
			email: email.toLowerCase(),
			passwordHash,
			displayName,
			hasCompletedOnboarding: false,
		});

		await user.save();

		// Generate tokens
		const payload = { userId: user._id.toString(), email: user.email };
		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		// Set refresh token as httpOnly cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(201).json({
			user: {
				_id: user._id.toString(),
				email: user.email,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
				hasCompletedOnboarding: user.hasCompletedOnboarding,
				createdAt: user.createdAt.toISOString(),
			},
			accessToken,
			refreshToken,
		});
	} catch (error) {
		next(error);
	}
});

// Login
router.post('/login', async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new AppError('Email and password are required', 400);
		}

		// Find user
		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			throw new AppError('Invalid email or password', 401);
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.passwordHash);
		if (!isValidPassword) {
			throw new AppError('Invalid email or password', 401);
		}

		// Generate tokens
		const payload = { userId: user._id.toString(), email: user.email };
		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		// Set refresh token as httpOnly cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.json({
			user: {
				_id: user._id.toString(),
				email: user.email,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
				hasCompletedOnboarding: user.hasCompletedOnboarding,
				createdAt: user.createdAt.toISOString(),
			},
			accessToken,
			refreshToken,
		});
	} catch (error) {
		next(error);
	}
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
	try {
		const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

		if (!refreshToken) {
			throw new AppError('Refresh token required', 401);
		}

		// Verify refresh token
		const payload = verifyRefreshToken(refreshToken);

		// Generate new access token
		const accessToken = generateAccessToken(payload);

		res.json({ accessToken });
	} catch (error) {
		next(error);
	}
});

// Logout
router.post('/logout', authenticateToken, (_req, res) => {
	res.clearCookie('refreshToken');
	res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res, next) => {
	try {
		const user = await User.findById(req.userId).select('-passwordHash');
		if (!user) {
			throw new AppError('User not found', 404);
		}

		res.json({
			_id: user._id.toString(),
			email: user.email,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
			hasCompletedOnboarding: user.hasCompletedOnboarding,
			createdAt: user.createdAt.toISOString(),
		});
	} catch (error) {
		next(error);
	}
});

// Update current user
router.put('/me', authenticateToken, async (req: AuthRequest, res, next) => {
	try {
		const { displayName, avatarUrl } = req.body;

		if (!displayName) {
			throw new AppError('Display name is required', 400);
		}

		const user = await User.findById(req.userId);
		if (!user) {
			throw new AppError('User not found', 404);
		}

		user.displayName = displayName;
		if (avatarUrl !== undefined) {
			user.avatarUrl = avatarUrl;
		}

		await user.save();

		res.json({
			_id: user._id.toString(),
			email: user.email,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
			hasCompletedOnboarding: user.hasCompletedOnboarding,
			createdAt: user.createdAt.toISOString(),
		});
	} catch (error) {
		next(error);
	}
});

export default router;

