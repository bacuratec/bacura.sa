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
export const requestersApi = createApi({
  reducerPath: "requestersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    prepareHeaders: (headers, { getState, dispatch }) => {
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
    getRequestersAccounts: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, AccountStatus = "" }) => ({
        url: "api/admins/requesters-accounts",
        params: { PageNumber, PageSize, AccountStatus },
      }),
    }),
  }),
});

export const { useGetRequestersAccountsQuery } = requestersApi;
