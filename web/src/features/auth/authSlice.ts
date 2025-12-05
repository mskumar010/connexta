import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { authApi } from '@/api/authApi';

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

// Load token from localStorage on init
const loadTokenFromStorage = (): string | null => {
	try {
		return localStorage.getItem('accessToken');
	} catch {
		return null;
	}
};

const loadUserFromStorage = (): User | null => {
	try {
		const userStr = localStorage.getItem('user');
		return userStr ? JSON.parse(userStr) : null;
	} catch {
		return null;
	}
};

const initialState: AuthState = {
	user: loadUserFromStorage(),
	accessToken: loadTokenFromStorage(),
	refreshToken: localStorage.getItem('refreshToken'),
	isAuthenticated: !!loadTokenFromStorage(),
	isLoading: false,
};

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{
				user: User;
				accessToken: string;
				refreshToken: string;
			}>
		) => {
			const { user, accessToken, refreshToken } = action.payload;
			state.user = user;
			state.accessToken = accessToken;
			state.refreshToken = refreshToken;
			state.isAuthenticated = true;

			// Persist to localStorage
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
			localStorage.setItem('user', JSON.stringify(user));
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
			localStorage.setItem('user', JSON.stringify(action.payload));
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		logout: (state) => {
			state.user = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.isAuthenticated = false;

			// Clear localStorage
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('user');
		},
		setAccessToken: (state, action: PayloadAction<string>) => {
			state.accessToken = action.payload;
			localStorage.setItem('accessToken', action.payload);
		},
	},
	extraReducers: (builder) => {
		builder
			.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
				const { user, accessToken, refreshToken } = action.payload;
				state.user = user;
				state.accessToken = accessToken;
				state.refreshToken = refreshToken;
				state.isAuthenticated = true;
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', refreshToken);
				localStorage.setItem('user', JSON.stringify(user));
			})
			.addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
				const { user, accessToken, refreshToken } = action.payload;
				state.user = user;
				state.accessToken = accessToken;
				state.refreshToken = refreshToken;
				state.isAuthenticated = true;
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', refreshToken);
				localStorage.setItem('user', JSON.stringify(user));
			})
			.addMatcher(authApi.endpoints.refresh.matchFulfilled, (state, action) => {
				state.accessToken = action.payload.accessToken;
				localStorage.setItem('accessToken', action.payload.accessToken);
			})
			.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
				state.user = null;
				state.accessToken = null;
				state.refreshToken = null;
				state.isAuthenticated = false;
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('user');
			});
	},
});

export const { setCredentials, setUser, setLoading, logout, setAccessToken } =
	authSlice.actions;

export default authSlice.reducer;

