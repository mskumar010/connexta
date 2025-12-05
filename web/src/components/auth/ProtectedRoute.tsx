import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated } = useSelector((state: RootState) => state.auth);
	const location = useLocation();

	if (!isAuthenticated) {
		// Redirect to login with return URL
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
}

