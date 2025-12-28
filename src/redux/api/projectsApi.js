import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const projectsApi = createApi({
  reducerPath: "projectsApis",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Orders", "Projects"],
  endpoints: (builder) => ({
    // Get All Projects/Orders (Admin)
    getProjects: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 10,
        OrderTitle = "",
        OrderStatusLookupId,
      }) => {
        const filters = {};
        if (OrderStatusLookupId) {
          filters.status_id = OrderStatusLookupId;
        }
        if (OrderTitle) {
          filters.title = { operator: "ilike", value: `%${OrderTitle}%` };
        }
        return {
          table: "projects",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "requester:profiles!projects_requester_id_fkey(id,full_name,email)",
            "request:requests(id,title,description,requester_id, service:services(id,name_ar,name_en))",
            "provider:profiles!projects_provider_id_fkey(id,full_name,email)",
            "status:project_statuses!projects_status_id_fkey(id,name_ar,name_en,code)",
          ],
        };
      },
      providesTags: ["Orders"],
    }),
    // Get Provider Projects/Orders
    getProjectsProviders: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 10,
        OrderTitle = "",
        OrderStatusLookupId,
        providerId,
      }) => {
        const filters = {};
        if (providerId) {
          filters.provider_id = providerId;
        }
        if (OrderStatusLookupId) {
          filters.status_id = OrderStatusLookupId;
        }
        if (OrderTitle) {
          filters.title = { operator: "ilike", value: `%${OrderTitle}%` };
        }
        return {
          table: "projects",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "requester:profiles!projects_requester_id_fkey(id,full_name,email)",
            "request:requests(id,title,description,requester_id, service:services(id,name_ar,name_en))",
            "provider:profiles!projects_provider_id_fkey(id,full_name,email)",
            "status:project_statuses!projects_status_id_fkey(id,name_ar,name_en,code)",
          ],
        };
      },
      providesTags: ["Orders"],
    }),
    // Get Project Details
    getProjectDetails: builder.query({
      query: ({ id }) => ({
        table: "projects",
        method: "GET",
        id,
        joins: [
          "requester:profiles!projects_requester_id_fkey(id,full_name,email)",
          "request:requests(id,title,description,requester_id, service:services(id,name_ar,name_en,price))",
          "provider:profiles!projects_provider_id_fkey(id,full_name,email)",
          "status:project_statuses!projects_status_id_fkey(id,name_ar,name_en,code)",
        ],
      }),
      providesTags: ["Orders"],
    }),
    // Get Project Statistics
    getProjectStatistics: builder.query({
      query: () => {
        // This would need custom logic - for now return orders count
        return {
          table: "projects",
          method: "GET",
          filters: {},
        };
      },
      providesTags: ["Orders"],
    }),
    // Provider Update Order Status
    ProviderProjectState: builder.mutation({
      query: (body) => ({
        table: "projects",
        method: "PUT",
        id: body.orderId,
        body: {
          status_id: body.statusId,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    // Add Order Attachments
    addOrderAttachments: builder.mutation({
      query: ({ body, projectId }) => ({
        table: "projects",
        method: "PUT",
        id: projectId,
        body: {
          // order_attachments_group_key: body.attachmentsGroupKey, // Not in schema
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    // Complete Order
    completeOrder: builder.mutation({
      query: ({ body, projectId }) => ({
        table: "projects",
        method: "PUT",
        id: projectId,
        body: {
          status_id: body.statusId, // completed status
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    // Delete Project/Order
    deleteProject: builder.mutation({
      query: (id) => ({
        table: "projects",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectDetailsQuery,
  useProviderProjectStateMutation,
  useGetProjectStatisticsQuery,
  useAddOrderAttachmentsMutation,
  useCompleteOrderMutation,
  useGetProjectsProvidersQuery,
  useDeleteProjectMutation,
} = projectsApi;
