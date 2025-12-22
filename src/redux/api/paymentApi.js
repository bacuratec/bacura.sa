import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const paymentApi = createApi({
  reducerPath: "paymentApi",
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
  // /api/partners
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (body) => ({
        url: "api/payments/create-payment-intent",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreatePaymentMutation } = paymentApi;
