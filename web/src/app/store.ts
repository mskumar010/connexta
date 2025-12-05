import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import roomsReducer from '@/features/rooms/roomsSlice';
import chatReducer from '@/features/chat/chatSlice';
import connectionReducer from '@/features/connection/connectionSlice';
import onboardingReducer from '@/features/onboarding/onboardingSlice';
import { authApi } from '@/api/authApi';
import { roomsApi } from '@/api/roomsApi';
import { messagesApi } from '@/api/messagesApi';
import { rtkQueryErrorLogger } from '@/middleware/rtkQueryErrorLogger';

const rootReducer = combineReducers({
	auth: authReducer,
	rooms: roomsReducer,
	chat: chatReducer,
	connection: connectionReducer,
	onboarding: onboardingReducer,
	[authApi.reducerPath]: authApi.reducer,
	[roomsApi.reducerPath]: roomsApi.reducer,
	[messagesApi.reducerPath]: messagesApi.reducer,
});

// Load state from localStorage
const loadState = () => {
	try {
		const serializedState = localStorage.getItem('echoRoomState');
		if (serializedState === null) {
			return undefined;
		}
		return JSON.parse(serializedState);
	} catch (err) {
		return undefined;
	}
};

// Save state to localStorage
const saveState = (state: RootState) => {
	try {
		const serializedState = JSON.stringify({
			connection: state.connection,
		});
		localStorage.setItem('echoRoomState', serializedState);
	} catch {
		// Ignore write errors
	}
};

const preloadedState = loadState();

export const store = configureStore({
	reducer: rootReducer,
	preloadedState,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ['socket/connect', 'socket/disconnect'],
			},
		})
			.concat(authApi.middleware)
			.concat(roomsApi.middleware)
			.concat(messagesApi.middleware)
			.concat(rtkQueryErrorLogger),
});

store.subscribe(() => {
	saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

