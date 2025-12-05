import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Room } from '@/types';
import { roomsApi } from '@/api/roomsApi';

interface RoomsState {
	rooms: Room[];
	activeRoomId: string | null;
	isLoading: boolean;
}

const initialState: RoomsState = {
	rooms: [],
	activeRoomId: null,
	isLoading: false,
};

export const roomsSlice = createSlice({
	name: 'rooms',
	initialState,
	reducers: {
		setRooms: (state, action: PayloadAction<Room[]>) => {
			state.rooms = action.payload;
		},
		addRoom: (state, action: PayloadAction<Room>) => {
			if (!state.rooms.find((r) => r._id === action.payload._id)) {
				state.rooms.push(action.payload);
			}
		},
		setActiveRoom: (state, action: PayloadAction<string | null>) => {
			state.activeRoomId = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addMatcher(roomsApi.endpoints.getRooms.matchPending, (state) => {
				state.isLoading = true;
			})
			.addMatcher(roomsApi.endpoints.getRooms.matchFulfilled, (state, action) => {
				state.rooms = action.payload;
				state.isLoading = false;
			})
			.addMatcher(roomsApi.endpoints.getRooms.matchRejected, (state) => {
				state.isLoading = false;
			})
			.addMatcher(roomsApi.endpoints.createRoom.matchFulfilled, (state, action) => {
				if (!state.rooms.find((r) => r._id === action.payload._id)) {
					state.rooms.push(action.payload);
				}
			});
	},
});

export const { setRooms, addRoom, setActiveRoom, setLoading } = roomsSlice.actions;

export default roomsSlice.reducer;

