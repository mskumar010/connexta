import { createApi } from "@reduxjs/toolkit/query/react";
import type { Message } from "@/types";
import { baseQueryWithReauth } from "@/api/baseQuery";

export const messagesApi = createApi({
  reducerPath: "messagesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Message"],
  endpoints: (builder) => ({
    // Update type definition
    getMessages: builder.query<
      Message[],
      { roomId: string; limit?: number; before?: string; isDm?: boolean }
    >({
      query: ({ roomId, limit = 50, before, isDm }) => {
        console.log("getMessages query args:", { roomId, isDm });
        const params = new URLSearchParams();
        if (limit) params.append("limit", limit.toString());
        if (before) params.append("before", before);

        const baseUrl = isDm
          ? `/conversations/${roomId}/messages`
          : `/rooms/${roomId}/messages`;

        return `${baseUrl}?${params.toString()}`;
      },
      providesTags: (_result, _error, { roomId }) => [
        { type: "Message", id: roomId },
      ],
    }),
  }),
});

export const { useGetMessagesQuery } = messagesApi;
