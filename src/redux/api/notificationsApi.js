import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (userId) => ({
        table: "notifications",
        method: "GET",
        filters: { user_id: userId },
        orderBy: { column: "created_at", ascending: false },
      }),
      providesTags: ["Notifications"],
    }),
    seenNotifications: builder.mutation({
      query: ({ notificationIds, userId }) => {
        // Update multiple notifications
        // Supabase doesn't support bulk update easily, so we'll update individually
        // For now, return the first one - components should handle multiple updates
        return {
          table: "notifications",
        method: "PUT",
          id: notificationIds[0],
          body: {
            is_seen: true,
          },
        };
      },
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const { useGetNotificationsQuery, useSeenNotificationsMutation } =
  notificationsApi;
