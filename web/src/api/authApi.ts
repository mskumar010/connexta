import { createApi } from '@reduxjs/toolkit/query/react';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';
import { baseQueryWithReauth } from '@/api/baseQuery';

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['User'],
	endpoints: (builder) => ({
		register: builder.mutation<AuthResponse, RegisterCredentials>({
			query: (credentials) => ({
				url: '/auth/register',
				method: 'POST',
				body: credentials,
			}),
		}),
		login: builder.mutation<AuthResponse, LoginCredentials>({
			query: (credentials) => ({
				url: '/auth/login',
				method: 'POST',
				body: credentials,
			}),
		}),
		refresh: builder.mutation<{ accessToken: string }, void>({
			query: () => ({
				url: '/auth/refresh',
				method: 'POST',
			}),
		}),
		logout: builder.mutation<void, void>({
			query: () => ({
				url: '/auth/logout',
				method: 'POST',
			}),
		}),
		getMe: builder.query<User, void>({
			query: () => '/auth/me',
			providesTags: ['User'],
		}),
		updateProfile: builder.mutation<User, { displayName: string; avatarUrl?: string }>({
			query: (data) => ({
				url: '/auth/me',
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: ['User'],
		}),
	}),
});

export const {
	useRegisterMutation,
	useLoginMutation,
	useRefreshMutation,
	useLogoutMutation,
	useGetMeQuery,
	useUpdateProfileMutation,
} = authApi;

