import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { WelcomeRoom } from '@/features/onboarding/WelcomeRoom';
import { completeOnboarding } from '@/features/onboarding/onboardingSlice';
import type { RootState, AppDispatch } from '@/app/store';

export function WelcomePage() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { user } = useSelector((state: RootState) => state.auth);

	const handleComplete = () => {
		dispatch(completeOnboarding());
		navigate('/');
	};

	if (!user) {
		return null; // Should be protected by route, but safety check
	}

	return (
		<WelcomeRoom
			userName={user.displayName}
			userId={user._id}
			roomId="welcome"
			onComplete={handleComplete}
		/>
	);
}
