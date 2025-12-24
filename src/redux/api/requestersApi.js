import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const requestersApi = createApi({
  reducerPath: "requestersApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Requesters"],
  endpoints: (builder) => ({
    // Get Requesters Accounts (Admin)
    getRequestersAccounts: builder.query({
      query: ({ PageNumber = 1, PageSize = 10 }) => {
        const filters = {};
        // AccountStatus would need to be mapped to user.is_blocked
        // For now, we'll get all requesters with their user info
        return {
          table: "requesters",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "user:users(id,email,phone,role,is_blocked)",
            "entity_type:lookup_values!requesters_entity_type_id_fkey(id,name_ar,name_en,code)",
            "city:cities(id,name_ar,name_en)",
          ],
        };
      },
      providesTags: ["Requesters"],
    }),
    // Delete Requester
    deleteRequester: builder.mutation({
      query: (id) => ({
        table: "requesters",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Requesters"],
    }),
    // Update Requester Status (Block/Unblock User)
    updateRequesterStatus: builder.mutation({
      query: ({ body }) => {
        // First get the requester to find user_id
        // Then update users table
        return {
          table: "users",
        method: "PUT",
          id: body.userId, // Should be passed from component
          body: {
            is_blocked: body.isBlocked,
            updated_at: new Date().toISOString(),
          },
        };
      },
      invalidatesTags: ["Requesters"],
    }),
  }),
});

export const {
  useGetRequestersAccountsQuery,
  useDeleteRequesterMutation,
  useUpdateRequesterStatusMutation,
} = requestersApi;
