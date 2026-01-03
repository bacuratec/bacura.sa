import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const requestsApi = createApi({
    reducerPath: "requestsApi",
    baseQuery: supabaseBaseQuery,
    tagTypes: ["Requests"],
    endpoints: (builder) => ({
        // Get all requests (Admin)
        getAllRequests: builder.query({
            query: ({
                PageNumber = 1,
                PageSize = 10,
                requestStatus = "",
            }) => {
                const filters = {};
                if (requestStatus) {
                    filters.status_id = Number(requestStatus);
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
        // Delete Request
        deleteRequest: builder.mutation({
            query: (id) => ({
                table: "requests",
                method: "DELETE",
                id,
            }),
            invalidatesTags: ["Requests"],
        }),
        // Update Request Status
        updateRequestStatus: builder.mutation({
          query: ({ id, statusId }) => ({
            table: "requests",
            method: "PUT",
            id,
            body: {
              status_id: statusId,
              updated_at: new Date().toISOString(),
            },
          }),
          invalidatesTags: ["Requests"],
        }),
        updateRequestPaymentStatus: builder.mutation({
            query: ({ id, paymentStatus }) => ({
                table: "requests",
                method: "PUT",
                id,
                body: {
                    payment_status: paymentStatus,
                    updated_at: new Date().toISOString(),
                },
            }),
            invalidatesTags: ["Requests"],
        }),
    }),
});

export const {
    useGetAllRequestsQuery,
    useDeleteRequestMutation,
    useUpdateRequestStatusMutation,
    useUpdateRequestPaymentStatusMutation,
} = requestsApi;
