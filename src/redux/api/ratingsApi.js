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
export const ratingsApi = createApi({
  reducerPath: "ratingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    prepareHeaders: (headers, { getState, dispatch }) => {
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
    getRatings: builder.query({
      query: ({ PageNumber = 1, PageSize = 10 }) => ({
        url: "api/orders/orders-rating", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
        params: { PageNumber, PageSize },
      }),
    }),
    CreateRating: builder.mutation({
      query: (body) => ({
        url: "api/orders/order-rating",
        method: "PUT",
        body,
      }),
    }),
    // Delete Rating
    deleteRating: builder.mutation({
      query: (id) => ({
        url: `api/orders/orders-rating/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetRatingsQuery,
  useCreateRatingMutation,
  useDeleteRatingMutation,
} = ratingsApi;
