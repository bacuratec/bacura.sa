import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Requests", "Orders"],
  endpoints: (builder) => ({
    // Create Request
    createOrder: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "POST",
        body: {
          requester_id: body.requesterId,
          service_id: body.serviceId,
          city_id: body.cityId || null,
          title: body.title,
          description: body.description || null,
          status_id: body.statusId, // Should be pending status
          attachments_group_key: body.attachmentsGroupKey || null,
        },
      }),
      invalidatesTags: ["Requests"],
      }),
    // Create Priced Request (Consultation)
    createOrderPriced: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "POST",
        body: {
          requester_id: body.requesterId,
          service_id: body.serviceId,
          city_id: body.cityId || null,
          title: body.title,
          description: body.description || null,
          status_id: body.statusId, // Should be priced status
          attachments_group_key: body.attachmentsGroupKey || null,
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Get All Requests (Admin)
    getOrders: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, RequestStatus = "" }) => {
        const filters = {};
        if (RequestStatus) {
          filters.status_id = RequestStatus;
        }
        return {
          table: "requests",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "requester:requesters!requests_requester_id_fkey(id,name)",
            "service:services(id,name_ar,name_en)",
            "status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code)",
            "city:cities(id,name_ar,name_en)",
          ],
        };
      },
      providesTags: ["Requests"],
    }),
    // Get User Requests (Requester)
    getUserOrders: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, RequestStatus = "", CityId = "", ServiceId = "" }) => {
        const filters = {};
        if (RequestStatus) {
          filters.status_id = RequestStatus;
        }
        if (CityId) {
          filters.city_id = CityId;
        }
        if (ServiceId) {
          filters.service_id = ServiceId;
        }
        // Get requester_id from user_id - assumes RLS handles this filtering if we don't pass id, or we need to pass it?
        // Supabase query usually uses auth.uid() automatically for RLS, but if we want to filter by requester_id column explicitly:
        // However, `requests` table has `requester_id`. If `getUserOrders` is called with userId, we should use it.
        // But here the arguments are pagination and status.
        // We might rely on RLS or need to pass userId.
        return {
          table: "requests",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "requester:requesters!requests_requester_id_fkey(id,name)",
            "service:services(id,name_ar,name_en)",
            "status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code)",
            "city:cities(id,name_ar,name_en)",
          ],
        };
      },
      providesTags: ["Requests"],
    }),
    // Get Request Details
    getRequestDetails: builder.query({
      query: (id) => ({
        table: "requests",
        method: "GET",
        id,
        joins: [
          "requester:requesters!requests_requester_id_fkey(id,name)",
          "service:services(id,name_ar,name_en,price)",
          "status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code)",
          "city:cities(id,name_ar,name_en)",
        ],
      }),
      providesTags: ["Requests"],
    }),
    // Admin Request Pricing Action
    AdminRequestPrice: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "PUT",
        id: body.requestId,
        body: {
          status_id: body.statusId,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Requester Action (Accept/Reject)
    RequesterAction: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "PUT",
        id: body.requestId,
        body: {
          status_id: body.statusId,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Reassign Request to Provider (Create Order)
    ReassignRequestFn: builder.mutation({
      query: ({ orderId, providerId, requestId }) => {
        // If orderId exists, update; otherwise create new order
        if (orderId) {
          return {
            table: "orders",
        method: "PUT",
            id: orderId,
            body: {
              provider_id: providerId,
              updated_at: new Date().toISOString(),
            },
          };
        } else {
          // Get pending status for orders
          return {
            table: "orders",
            method: "POST",
            body: {
              request_id: requestId,
              provider_id: providerId,
              order_title: "مشروع جديد", // Should be set properly
              order_status_id: 17, // Waiting Approval
            },
          };
        }
      },
      invalidatesTags: ["Orders", "Requests"],
    }),
    // Admin Complete Request
    AdminCompleteRequest: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "PUT",
        id: body.requestId,
        body: {
          status_id: body.statusId, // completed status
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Delete Request
    deleteRequest: builder.mutation({
      query: (id) => ({
        table: "requests",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Requests"],
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
