import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";
import { jwtDecode } from "jwt-decode";
import ReassignRequest from "../../components/admin-components/projects/ReassignRequest";

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
export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    prepareHeaders: (headers, { getState, dispatch }) => {
      // أضف التوكن للـ Authorization header
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
    getNotifications: builder.query({
      query: () => ({
        url: "api/notifications",
        method: "GET",
      }),
    }),

    seenNotifications: builder.mutation({
      query: (body) => ({
        url: "api/notifications/mark-as-seen",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const { useGetNotificationsQuery, useSeenNotificationsMutation } =
  notificationsApi;
