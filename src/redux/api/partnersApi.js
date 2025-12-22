import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";
import { jwtDecode } from "jwt-decode";

function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp) {
      const now = Date.now() / 1000;
      return decoded.exp < now;
    }
    return false;
  } catch {
    return true;
  }
}

export const partnersApi = createApi({
  reducerPath: "partnersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
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
  // /api/partners
  endpoints: (builder) => ({
    createPartner: builder.mutation({
      query: (body) => ({
        url: "api/partners",
        method: "POST",
        body,
      }),
    }),

    getPartners: builder.query({
      query: () => ({
        url: "api/partners",
        method: "GET",
      }),
    }),

    getPartnerDetails: builder.query({
      query: (id) => ({
        url: `api/partners/${id}`,
        method: "GET",
      }),
    }),

    // ===== Update Partner =====
    updatePartner: builder.mutation({
      query: ({ id, body }) => ({
        url: `api/partners/${id}`,
        method: "PUT", // أو PATCH حسب الـ API
        body,
      }),
    }),

    // ===== Delete Partner =====
    deletePartner: builder.mutation({
      query: (id) => ({
        url: `api/partners/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreatePartnerMutation,
  useGetPartnersQuery,
  useGetPartnerDetailsQuery,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
} = partnersApi;
