import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChatArea } from '@/components/layout/ChatArea';
import { WelcomeRoom } from '@/features/onboarding/WelcomeRoom';
import { setFirstTime, completeOnboarding } from '@/features/onboarding/onboardingSlice';
import type { RootState } from '@/app/store';

export function HomePage() {
	const dispatch = useDispatch();
	const { user } = useSelector((state: RootState) => state.auth);
	const { isFirstTime, hasSeenWelcomeRoom } = useSelector(
		(state: RootState) => state.onboarding
	);

	// Check if user is first-time on mount
	useEffect(() => {
		if (user) {
			// Check localStorage first
			const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeRoom') === 'true';

			// If user has completed onboarding flag, they're not first-time
			if (user.hasCompletedOnboarding) {
				dispatch(setFirstTime(false));
			} else if (!hasSeenWelcome) {
				// First-time user
				dispatch(setFirstTime(true));
			} else {
				dispatch(setFirstTime(false));
			}
		}
	}, [user, dispatch]);

	// Show welcome room for first-time users
	if (isFirstTime && !hasSeenWelcomeRoom && user) {
		return (
			<WelcomeRoom
				userName={user.displayName}
				userId={user._id}
				roomId="welcome"
				onComplete={() => {
					dispatch(completeOnboarding());
				}}
			/>
		);
	}

	// Regular home page
	return (
		<ChatArea
			header={
				<div className="flex items-center gap-2">
					<span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Home</span>
				</div>
			}
		>
			<div className="flex h-full items-center justify-center">
				<div className="text-center space-y-4">
					<h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>Welcome to EchoRoom</h2>
					<p style={{ color: 'var(--color-text-tertiary)' }}>Select a room to start chatting</p>
				</div>
			</div>
		</ChatArea>
	);
}

