import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, disconnectSocket } from '@/lib/socket';
import type { RootState } from '@/app/store';
import { setStatus, setError, setLastEventId } from '@/features/connection/connectionSlice';
import type { SocketMessageNew, SocketTypingUpdate } from '@/types';

export function useSocket() {
	const dispatch = useDispatch();
	const { accessToken } = useSelector((state: RootState) => state.auth);
	const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

	useEffect(() => {
		if (!accessToken) {
			// Disconnect if no token
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			dispatch(setStatus('disconnected'));
			return;
		}

		dispatch(setStatus('connecting'));
		const socket = getSocket(accessToken);
		socketRef.current = socket;

		// Authenticate on connection
		socket.on('connect', () => {
			console.log('Socket connected:', socket.id);
			// Send auth identify
			socket.emit('auth:identify', { token: accessToken });
		});

		socket.on('auth:ok', () => {
			console.log('Socket authenticated');
			dispatch(setStatus('connected'));
			if (socket.id) {
				dispatch(setLastEventId(socket.id));
			}
		});

		socket.on('auth:error', (error: unknown) => {
			console.error('Socket auth error:', error);
			dispatch(setError('Authentication failed'));
			dispatch(setStatus('error'));
		});

		socket.on('disconnect', () => {
			console.log('Socket disconnected');
			dispatch(setStatus('disconnected'));
		});

		socket.on('connect_error', (error: unknown) => {
			console.error('Socket connection error:', error);
			const errorMessage =
				typeof error === 'object' && error !== null && 'message' in error
					? String(error.message)
					: 'Connection failed';
			dispatch(setError(errorMessage));
			dispatch(setStatus('error'));
		});

		socket.on('reconnect', () => {
			console.log('Socket reconnected');
			// Re-authenticate on reconnect
			if (accessToken) {
				socket.emit('auth:identify', { token: accessToken });
			}
		});

		socket.on('reconnect_attempt', () => {
			dispatch(setStatus('reconnecting'));
		});

		// Cleanup
		return () => {
			if (socketRef.current) {
				socketRef.current.removeAllListeners();
			}
		};
	}, [accessToken, dispatch]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (!accessToken) {
				disconnectSocket();
			}
		};
	}, [accessToken]);

	return socketRef.current;
}

