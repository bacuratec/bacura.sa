import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const profileInfoApi = createApi({
  reducerPath: "profileInfoApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["ProfileInfo"],
  endpoints: (builder) => ({
    createProfileInfo: builder.mutation({
      query: (body) => ({
        table: "profile_infos",
        method: "POST",
        body: {
          user_id: body.userId,
          bio: body.bio || null,
          website_url: body.websiteUrl || null,
          attachments_group_key: body.attachmentsGroupKey || null,
        },
      }),
      invalidatesTags: ["ProfileInfo"],
    }),
    getProfileInfo: builder.query({
      query: (userId) => ({
        table: "profile_infos",
        method: "GET",
        filters: { user_id: userId },
      }),
      providesTags: ["ProfileInfo"],
    }),
    updateProfileInfo: builder.mutation({
      query: ({ userId, body }) => ({
        table: "profile_infos",
        method: "PUT",
        id: userId, // This assumes user_id is unique
        body: {
          bio: body.bio || null,
          website_url: body.websiteUrl || null,
          attachments_group_key: body.attachmentsGroupKey || null,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["ProfileInfo"],
    }),
    // Note: downloadProfileInfo would need to be handled separately
    // as it's about downloading attachments, not querying profile_infos
  }),
});

export const {
  useCreateProfileInfoMutation,
  useGetProfileInfoQuery,
  useUpdateProfileInfoMutation,
} = profileInfoApi;
