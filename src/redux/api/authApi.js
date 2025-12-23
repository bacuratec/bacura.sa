import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const lang = localStorage.getItem("lang");
      if (lang) {
        headers.set("lang", lang);
        headers.set("accept-language", lang);
      }

      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: "api/auth/profile", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
      }),
    }),
    toggleBlockUser: builder.mutation({
      query: (id) => ({
        url: `api/auth/block-user/${id}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useToggleBlockUserMutation,
} = authApi;
