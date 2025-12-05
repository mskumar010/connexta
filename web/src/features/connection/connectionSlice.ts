import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ConnectionState {
	status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
	lastSeenSeq: number;
	lastEventId: string | null;
	rooms: {
		[roomId: string]: {
			lastSeenSeq: number;
		};
	};
	error: string | null;
}

const initialState: ConnectionState = {
	status: 'disconnected',
	lastSeenSeq: 0,
	lastEventId: null,
	rooms: {},
	error: null,
};

export const connectionSlice = createSlice({
	name: 'connection',
	initialState,
	reducers: {
		setStatus: (state, action: PayloadAction<ConnectionState['status']>) => {
			state.status = action.payload;
			state.error = null;
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
			state.status = 'error';
		},
		updateLastSeenSeq: (
			state,
			action: PayloadAction<{ roomId: string; seq: number }>
		) => {
			const { roomId, seq } = action.payload;
			state.rooms[roomId] = { lastSeenSeq: seq };
			state.lastSeenSeq = Math.max(state.lastSeenSeq, seq);
		},
		setLastEventId: (state, action: PayloadAction<string>) => {
			state.lastEventId = action.payload;
		},
		requestRecovery: (state) => {
			state.status = 'reconnecting';
		},
		recoverMessages: (
			state,
			action: PayloadAction<{
				roomId: string;
				messages: Array<{ seq: number }>;
			}>
		) => {
			const { roomId, messages } = action.payload;
			if (messages.length > 0) {
				const maxSeq = Math.max(...messages.map((m) => m.seq));
				state.rooms[roomId] = { lastSeenSeq: maxSeq };
				state.lastSeenSeq = Math.max(state.lastSeenSeq, maxSeq);
			}
			state.status = 'connected';
		},
		reset: () => initialState,
	},
});

export const {
	setStatus,
	setError,
	updateLastSeenSeq,
	setLastEventId,
	requestRecovery,
	recoverMessages,
	reset,
} = connectionSlice.actions;

export default connectionSlice.reducer;

