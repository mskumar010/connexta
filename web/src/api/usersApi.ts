import { createApi } from "@reduxjs/toolkit/query/react";
import type { User } from "@/types";
import { baseQueryWithReauth } from "@/api/baseQuery";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
    updateLocation: builder.mutation<
      { message: string; lastLocation: any },
      { latitude: number; longitude: number }
    >({
      query: (location) => ({
        url: "/users/location",
        method: "POST",
        body: location,
      }),
      // Optimistically update or invalidate? Invalidate is safer for now.
      invalidatesTags: ["User"],
    }),
    lookupUser: builder.query<User, string>({
      query: (connectionId) => `/users/lookup/${connectionId}`,
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateLocationMutation,
  useLazyLookupUserQuery,
} = usersApi;
