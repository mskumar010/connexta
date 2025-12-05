import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

/**
 * Log a warning and show a toast!
 */
export const rtkQueryErrorLogger: Middleware =
    (_api: MiddlewareAPI) => (next) => (action) => {
        // RTK Query uses `isRejectedWithValue` to match rejected actions
        if (isRejectedWithValue(action)) {
            // Skip 401 errors as they are handled by the re-auth logic (redirect to login)
            // Also skip if it's a "condition" error (e.g. aborted)
            if (
                action.payload &&
                typeof action.payload === 'object' &&
                'status' in action.payload &&
                action.payload.status === 401
            ) {
                return next(action);
            }

            const errorData = action.payload as {
                status?: number;
                data?: { message?: string };
            };

            const errorMessage =
                errorData?.data?.message || 'An unexpected error occurred';

            // Don't show toast for "Aborted" or "Canceled" errors
            if (errorMessage !== 'Aborted' && errorMessage !== 'Canceled') {
                toast.error(errorMessage);
            }
        }

        return next(action);
    };
