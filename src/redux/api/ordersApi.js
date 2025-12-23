import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
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
    createOrder: builder.mutation({
      query: (body) => ({
        url: "api/requests",
        method: "POST",
        body,
      }),
      // عادة لا نريد أوتو تسجيل بعد التسجيل؛ يمكن إعادة التوجيه للصفحة login
    }),
    createOrderPriced: builder.mutation({
      query: (body) => ({
        url: "api/requests/consultations",
        method: "POST",
        body,
      }),
      // عادة لا نريد أوتو تسجيل بعد التسجيل؛ يمكن إعادة التوجيه للصفحة login
    }),
    // لو فيه endpoint لفحص صلاحية التوكن أو استعادة بيانات المستخدم:
    getOrders: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, RequestStatus = "" }) => ({
        url: "api/requests", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
        params: { PageNumber, PageSize, RequestStatus },
      }),
    }),
    getUserOrders: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, RequestStatus = "" }) => ({
        url: "api/requests/requester-requests", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
        params: { PageNumber, PageSize, RequestStatus },
      }),
    }),
    getRequestDetails: builder.query({
      query: (id) => `api/requests/${id}`,
    }),
    AdminRequestPrice: builder.mutation({
      query: (body) => ({
        url: "api/requests/admin-request-pricing-action",
        method: "PUT",
        body,
      }),
    }),

    RequesterAction: builder.mutation({
      query: (body) => ({
        url: "api/requests/requester-action",
        method: "PUT",
        body,
      }),
    }),
    ReassignRequestFn: builder.mutation({
      query: ({ orderId, providerId }) => ({
        url: `api/orders/reassign-order/${orderId}/${providerId}/`,
        method: "PUT",
      }),
    }),
    AdminCompleteRequest: builder.mutation({
      query: (body) => ({
        url: "api/requests/admin-complete-request",
        method: "POST",
        body,
      }),
    }),
    // Delete Request
    deleteRequest: builder.mutation({
      query: (id) => ({
        url: `api/requests/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateOrderPricedMutation,
  useGetOrdersQuery,
  useGetUserOrdersQuery,
  useGetRequestDetailsQuery,
  useAdminRequestPriceMutation,
  useRequesterActionMutation,
  useAdminCompleteRequestMutation,
  useReassignRequestFnMutation,
  useDeleteRequestMutation,
} = ordersApi;
