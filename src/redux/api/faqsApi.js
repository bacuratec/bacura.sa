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

export const faqsApi = createApi({
  reducerPath: "faqsApi",
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
    createQuestion: builder.mutation({
      query: (body) => ({
        url: "api/Question",
        method: "POST",
        body,
      }),
    }),

    getQuestions: builder.query({
      query: () => ({
        url: "api/Question",
        method: "GET",
      }),
    }),

    getQuestionDetails: builder.query({
      query: (id) => ({
        url: `api/Question/${id}`,
        method: "GET",
      }),
    }),

    // ===== Update Question =====
    updateQuestion: builder.mutation({
      query: ({ id, body }) => ({
        url: `api/Question/${id}`,
        method: "PUT", // أو PATCH حسب الـ API
        body,
      }),
    }),

    // ===== Delete Question =====
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `api/Question/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateQuestionMutation,
  useGetQuestionsQuery,
  useGetQuestionDetailsQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = faqsApi;
