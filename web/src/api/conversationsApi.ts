import { createApi } from "@reduxjs/toolkit/query/react";
import type { Conversation } from "@/types";
import { baseQueryWithReauth } from "@/api/baseQuery";

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Conversation"],
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => "/conversations",
      providesTags: ["Conversation"],
    }),
    getConversation: builder.query<Conversation, string>({
      query: (id) => `/conversations/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Conversation", id }],
    }),
    requestConnection: builder.mutation<
      Conversation,
      { targetConnectionId: string }
    >({
      query: (body) => ({
        url: "/conversations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversation"],
    }),
    acceptConnection: builder.mutation<Conversation, string>({
      query: (id) => ({
        url: `/conversations/${id}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Conversation"],
    }),
    rejectConnection: builder.mutation<Conversation, string>({
      query: (id) => ({
        url: `/conversations/${id}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Conversation"],
    }),
    deleteConversation: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/conversations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Conversation"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useRequestConnectionMutation,
  useAcceptConnectionMutation,
  useRejectConnectionMutation,
  useDeleteConversationMutation,
} = conversationsApi;
