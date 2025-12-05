import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface OnboardingState {
	isFirstTime: boolean;
	hasSeenWelcomeRoom: boolean;
	welcomeRoomId: string | null;
}

const initialState: OnboardingState = {
	isFirstTime: false,
	hasSeenWelcomeRoom: false,
	welcomeRoomId: null,
};

export const onboardingSlice = createSlice({
	name: 'onboarding',
	initialState,
	reducers: {
		setFirstTime: (state, action: PayloadAction<boolean>) => {
			state.isFirstTime = action.payload;
		},
		setHasSeenWelcomeRoom: (state, action: PayloadAction<boolean>) => {
			state.hasSeenWelcomeRoom = action.payload;
		},
		setWelcomeRoomId: (state, action: PayloadAction<string | null>) => {
			state.welcomeRoomId = action.payload;
		},
		completeOnboarding: (state) => {
			state.isFirstTime = false;
			state.hasSeenWelcomeRoom = true;
			localStorage.setItem('hasSeenWelcomeRoom', 'true');
		},
	},
});

export const {
	setFirstTime,
	setHasSeenWelcomeRoom,
	setWelcomeRoomId,
	completeOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

