// src/redux/api/updateApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";
import { jwtDecode } from "jwt-decode";
function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    // JWT عادة exp كوحدة ثواني من 1970
    if (decoded.exp) {
      const now = Date.now() / 1000;
      return decoded.exp < now;
    }
    return false;
  } catch {
    return true;
  }
}
export const updateApi = createApi({
  reducerPath: "updateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL, // مثلاً: "https://your-api.com/"
    prepareHeaders: (headers, { getState }) => {
      const lang = localStorage.getItem("lang");
      if (lang) {
        headers.set("lang", lang);
        headers.set("accept-language", lang);
      }
      // أضف التوكن للـ Authorization header
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    updateProvider: builder.mutation({
      query: (body) => ({
        url: "api/auth/update-provider",
        method: "PUT",
        body,
      }),
    }),
    updateRequester: builder.mutation({
      query: (body) => ({
        url: "api/auth/update-requester",
        method: "PUT",
        body,
      }),
    }),
    updateAdmin: builder.mutation({
      query: (body) => ({
        url: "api/auth/update-admin",
        method: "PUT",
        body,
      }),
    }),
    suspendRequester: builder.mutation({
      query: () => ({
        url: "api/requesters/suspend-my-account",
        method: "PUT",
      }),
    }),
    suspendProvider: builder.mutation({
      query: () => ({
        url: "api/providers/suspend-my-account",
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useUpdateProviderMutation,
  useUpdateRequesterMutation,
  useUpdateAdminMutation,
  useSuspendProviderMutation,
  useSuspendRequesterMutation,
} = updateApi;
