import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (body) => ({
        table: "payments",
        method: "POST",
        body: {
          order_id: body.orderId,
          user_id: body.userId,
          amount: body.amount,
          currency: body.currency || "SAR",
          stripe_payment_intent_id: body.stripePaymentIntentId || null,
          status: body.status || "pending",
        },
      }),
      invalidatesTags: ["Payments"],
    }),
    getPayments: builder.query({
      query: ({ orderId, userId }) => {
        const filters = {};
        if (orderId) filters.order_id = orderId;
        if (userId) filters.user_id = userId;
        return {
          table: "payments",
          method: "GET",
          filters,
          orderBy: { column: "created_at", ascending: false },
          joins: [
            "order:orders(id,order_title)",
            "user:users(id,email)",
          ],
        };
      },
      providesTags: ["Payments"],
    }),
    updatePaymentStatus: builder.mutation({
      query: ({ id, body }) => ({
        table: "payments",
        method: "PUT",
        id,
        body: {
          status: body.status,
          stripe_payment_intent_id: body.stripePaymentIntentId || null,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Payments"],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useUpdatePaymentStatusMutation,
} = paymentApi;
