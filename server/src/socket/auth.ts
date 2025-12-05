import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedSocket extends Socket {
	userId?: string;
	userEmail?: string;
}

export function authenticateSocket(socket: AuthenticatedSocket, token: string): boolean {
	try {
		const payload = verifyAccessToken(token);
		socket.userId = payload.userId;
		socket.userEmail = payload.email;
		return true;
	} catch (error) {
		return false;
	}
}

