import { Router } from 'express';
import { Room } from '../models/Room';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all rooms
router.get('/', authenticateToken, async (_req, res, next) => {
	try {
		const rooms = await Room.find().populate('createdBy', 'displayName').sort({ createdAt: -1 });

		res.json(
			rooms.map((room) => ({
				_id: room._id.toString(),
				name: room.name,
				slug: room.slug,
				description: room.description,
				tags: room.tags || [],
				members: room.members.map((id) => id.toString()),
				createdBy: room.createdBy ? room.createdBy.toString() : 'system',
				createdAt: room.createdAt.toISOString(),
			}))
		);
	} catch (error) {
		next(error);
	}
});

// Get single room
router.get('/:id', authenticateToken, async (req, res, next) => {
	try {
		const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
		const room = await Room.findOne({
			$or: [{ _id: isObjectId ? req.params.id : null }, { slug: req.params.id }],
		}).populate('createdBy', 'displayName');

		if (!room) {
			throw new AppError('Room not found', 404);
		}

		res.json({
			_id: room._id.toString(),
			name: room.name,
			slug: room.slug,
			description: room.description,
			tags: room.tags || [],
			members: room.members.map((id) => id.toString()),
			createdBy: room.createdBy ? room.createdBy.toString() : 'system',
			createdAt: room.createdAt.toISOString(),
		});
	} catch (error) {
		next(error);
	}
});

// Create room
router.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
	try {
		const { name, description, tags } = req.body;

		if (!name) {
			throw new AppError('Room name is required', 400);
		}

		if (!tags || !Array.isArray(tags) || tags.length === 0) {
			throw new AppError('At least one tag is required', 400);
		}

		// Generate slug from name
		const slug = name
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');

		// Check if slug exists
		const existingRoom = await Room.findOne({ slug });
		if (existingRoom) {
			throw new AppError('Room with this name already exists', 409);
		}

		const room = new Room({
			name,
			slug,
			description,
			tags,
			createdBy: req.userId,
		});

		await room.save();

		// Populate room with initial messages
		try {
			const { populateRoomMessages } = await import('../utils/demoData');
			await populateRoomMessages(room._id.toString());
		} catch (popError: any) {
			console.error('Failed to populate room:', popError);
			// Don't fail the request, just log it, or return a warning?
			// For now, let's fail it so we see the error in the UI
			throw new AppError(`Room created but failed to populate: ${popError.message}`, 500);
		}

		res.status(201).json({
			_id: room._id.toString(),
			name: room.name,
			slug: room.slug,
			description: room.description,
			tags: room.tags,
			createdBy: room.createdBy.toString(),
			createdAt: room.createdAt.toISOString(),
		});
	} catch (error: any) {
		console.error('Room creation error:', error);
		next(error);
	}
});

// Join room
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res, next) => {
	try {
		const room = await Room.findOne({
			$or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
		});

		if (!room) {
			throw new AppError('Room not found', 404);
		}

		// Check if already member
		if (room.members.includes(req.userId as any)) {
			res.json({ message: 'Already a member' });
			return;
		}

		room.members.push(req.userId as any);
		await room.save();

		res.json({ message: 'Joined room successfully' });
	} catch (error) {
		next(error);
	}
});

// Leave room
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res, next) => {
	try {
		const room = await Room.findOne({
			$or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
		});

		if (!room) {
			throw new AppError('Room not found', 404);
		}

		// Remove from members
		room.members = room.members.filter((id) => id.toString() !== req.userId);
		await room.save();

		res.json({ message: 'Left room successfully' });
	} catch (error) {
		next(error);
	}
});

export default router;

