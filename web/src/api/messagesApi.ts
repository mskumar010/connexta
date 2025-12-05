import { createApi } from '@reduxjs/toolkit/query/react';
import type { Message } from '@/types';
import { baseQueryWithReauth } from '@/api/baseQuery';

export const messagesApi = createApi({
	reducerPath: 'messagesApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Message'],
	endpoints: (builder) => ({
		getMessages: builder.query<
			Message[],
			{ roomId: string; limit?: number; before?: string }
		>({
			query: ({ roomId, limit = 50, before }) => {
				const params = new URLSearchParams();
				if (limit) params.append('limit', limit.toString());
				if (before) params.append('before', before);
				return `/rooms/${roomId}/messages?${params.toString()}`;
			},
			providesTags: (_result, _error, { roomId }) => [
				{ type: 'Message', id: roomId },
			],
		}),
	}),
});

export const { useGetMessagesQuery } = messagesApi;

