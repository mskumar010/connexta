import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
	userId?: string;
	userEmail?: string;
}

export function authenticateToken(
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

	if (!token) {
		res.status(401).json({ message: 'Access token required' });
		return;
	}

	try {
		const payload = verifyAccessToken(token);
		req.userId = payload.userId;
		req.userEmail = payload.email;
		next();
	} catch (error) {
		res.status(401).json({ message: 'Invalid or expired token' });
	}
}

