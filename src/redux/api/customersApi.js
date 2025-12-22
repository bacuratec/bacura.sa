import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customersApi = createApi({
  reducerPath: "customersApi",
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
  // /api/customers
  endpoints: (builder) => ({
    createCustomer: builder.mutation({
      query: (body) => ({
        url: "api/customers",
        method: "POST",
        body,
      }),
    }),

    getCustomers: builder.query({
      query: () => ({
        url: "api/customers",
        method: "GET",
      }),
    }),

    getCustomerDetails: builder.query({
      query: (id) => ({
        url: `api/customers/${id}`,
        method: "GET",
      }),
    }),

    // ===== Update Customer =====
    updateCustomer: builder.mutation({
      query: ({ id, body }) => ({
        url: `api/customers/${id}`,
        method: "PUT", // أو PATCH حسب الـ API
        body,
      }),
    }),

    // ===== Delete Customer =====
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `api/customers/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateCustomerMutation,
  useGetCustomersQuery,
  useGetCustomerDetailsQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
