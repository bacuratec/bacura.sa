// src/redux/api/adminStatisticsApi.js
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
export const adminStatisticsApi = createApi({
  reducerPath: "adminStatisticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL, // أو استخدم base URL مباشر
    prepareHeaders: (headers, { getState, dispatch }) => {
      const token = getState().auth.token;
      const lang = localStorage.getItem("lang");
      if (lang) {
        headers.set("lang", lang);
        headers.set("accept-language", lang);
      }
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getRequestersStatistics: builder.query({
      query: () => "api/admins/requesters-statistics",
    }),
    getServiceProvidersStatistics: builder.query({
      query: () => "api/admins/service-providers-statistics",
    }),
    getRequestsStatistics: builder.query({
      query: () => "api/requests/requests-statistics",
    }),
    getAdminStatistics: builder.query({
      query: () => "api/admins/platform-statistics",
    }),
    getProviderOrderStatistics: builder.query({
      query: ({ providerId }) => ({
        url: "api/orders/provider-orders-statistics",
        params: { providerId },
      }),
    }),
  }),
});

export const {
  useGetRequestersStatisticsQuery,
  useGetServiceProvidersStatisticsQuery,
  useGetRequestsStatisticsQuery,
  useGetAdminStatisticsQuery,
  useGetProviderOrderStatisticsQuery,
} = adminStatisticsApi;
