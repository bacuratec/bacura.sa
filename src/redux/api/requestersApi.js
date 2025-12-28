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
        const filters = { role: "Requester" };
        return {
          table: "profiles",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "entity_type:entity_types(id,name_ar,name_en,type)",
            "city:cities(id,name_ar,name_en)",
          ],
        };
      },
      providesTags: ["Requesters"],
    }),
    // Delete Requester
    deleteRequester: builder.mutation({
      query: (id) => ({
        table: "profiles",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Requesters"],
    }),
    // Update Requester Status (Block/Unblock User)
    updateRequesterStatus: builder.mutation({
      query: ({ body }) => {
        return {
          table: "profiles",
          method: "PUT",
          id: body.userId, 
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
