// src/services/detailsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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
export const detailsApi = createApi({
  reducerPath: "detailsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
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
  }), // استبدل {{base_url}} باللينك الحقيقي
  endpoints: (builder) => ({
    getProviderDetails: builder.query({
      query: (id) => `api/providers/${id}`,
    }),
    getRequesterDetails: builder.query({
      query: (id) => `api/requesters/${id}`,
    }),
    getAdminDetails: builder.query({
      query: (id) => `api/admins/${id}`,
    }),
  }),
});

export const {
  useGetProviderDetailsQuery,
  useGetRequesterDetailsQuery,
  useGetAdminDetailsQuery,
} = detailsApi;
