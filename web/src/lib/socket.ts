import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
	// If socket exists and token changed, disconnect and recreate
	if (socket) {
		const currentToken = (socket.auth as { token?: string })?.token;
		if (currentToken !== token) {
			socket.disconnect();
			socket = null;
		} else if (socket.connected) {
			return socket;
		}
	}

	socket = io(SOCKET_URL, {
		transports: ['websocket', 'polling'],
		auth: token ? { token } : undefined,
		autoConnect: !!token,
	});

	return socket;
}

export function disconnectSocket() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}

export function getCurrentSocket(): Socket | null {
	return socket;
}

