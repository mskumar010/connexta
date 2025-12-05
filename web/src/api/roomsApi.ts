import { createApi } from '@reduxjs/toolkit/query/react';
import type { Room } from '@/types';
import { baseQueryWithReauth } from '@/api/baseQuery';

export const roomsApi = createApi({
	reducerPath: 'roomsApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Room'],
	endpoints: (builder) => ({
		getRooms: builder.query<Room[], void>({
			query: () => '/rooms',
			providesTags: ['Room'],
		}),
		getRoom: builder.query<Room, string>({
			query: (id) => `/rooms/${id}`,
			providesTags: (_result, _error, id) => [{ type: 'Room', id }],
		}),
		createRoom: builder.mutation<Room, { name: string; description?: string; tags: string[] }>({
			query: (body) => ({
				url: '/rooms',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Room'],
		}),
		joinRoom: builder.mutation<void, string>({
			query: (roomId) => ({
				url: `/rooms/${roomId}/join`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, arg) => [{ type: 'Room', id: arg }, 'Room'],
		}),
		leaveRoom: builder.mutation<void, string>({
			query: (roomId) => ({
				url: `/rooms/${roomId}/leave`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, arg) => [{ type: 'Room', id: arg }, 'Room'],
		}),
	}),
});

export const {
	useGetRoomsQuery,
	useGetRoomQuery,
	useCreateRoomMutation,
	useJoinRoomMutation,
	useLeaveRoomMutation,
} = roomsApi;

