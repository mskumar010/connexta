import jwt, { type SignOptions } from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET || 'your-secret-key-change-in-production') as string;
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production') as string;
const JWT_ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as string;
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string;

export interface JWTPayload {
	userId: string;
	email: string;
}

export function generateAccessToken(payload: JWTPayload): string {
	return jwt.sign(
		{ userId: payload.userId, email: payload.email },
		JWT_SECRET,
		{ expiresIn: JWT_ACCESS_EXPIRES_IN } as SignOptions
	);
}

export function generateRefreshToken(payload: JWTPayload): string {
	return jwt.sign(
		{ userId: payload.userId, email: payload.email },
		JWT_REFRESH_SECRET,
		{ expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions
	);
}

export function verifyAccessToken(token: string): JWTPayload {
	try {
		return jwt.verify(token, JWT_SECRET) as JWTPayload;
	} catch (error) {
		throw new Error('Invalid or expired access token');
	}
}

export function verifyRefreshToken(token: string): JWTPayload {
	try {
		return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
	} catch (error) {
		throw new Error('Invalid or expired refresh token');
	}
}

