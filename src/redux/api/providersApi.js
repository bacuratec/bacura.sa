import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const providersApi = createApi({
  reducerPath: "providersApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Providers"],
  endpoints: (builder) => ({
    // Get Providers Accounts (Admin)
    getProvidersAccounts: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 10,
        AccountStatus = "",
        name = "",
      }) => {
        const filters = {};
        if (name) {
          filters.name = { operator: "ilike", value: `%${name}%` };
        }
        // AccountStatus would need to be mapped to user.is_blocked
        return {
          table: "providers",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "user:users(id,email,phone,role,is_blocked)",
            "entity_type:lookup_values!providers_entity_type_id_fkey(id,name_ar,name_en,code)",
            "city:cities(id,name_ar,name_en)",
          ],
        };
      },
      providesTags: ["Providers"],
    }),
    // Delete Provider
    deleteProvider: builder.mutation({
      query: (id) => ({
        table: "providers",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Providers"],
    }),
    // Update Provider Status (Block/Unblock User)
    updateProviderStatus: builder.mutation({
      query: ({ id, body }) => {
        // Update users table
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
      invalidatesTags: ["Providers"],
    }),
  }),
});

export const {
  useGetProvidersAccountsQuery,
  useLazyGetProvidersAccountsQuery,
  useDeleteProviderMutation,
  useUpdateProviderStatusMutation,
} = providersApi;
