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
export const projectsApi = createApi({
  reducerPath: "projectsApis",
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
    getProjects: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 10,
        OrderTitle = "",
        OrderStatusLookupId,
      }) => ({
        url: "api/orders", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
        params: { PageNumber, PageSize, OrderTitle, OrderStatusLookupId },
      }),
    }),
    getProjectsProviders: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 10,
        OrderTitle = "",
        OrderStatusLookupId,
      }) => ({
        url: "api/orders/provider-orders", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
        params: { PageNumber, PageSize, OrderTitle, OrderStatusLookupId },
      }),
    }),
    getProjectDetails: builder.query({
      query: ({ id, params }) => ({
        url: `api/orders/${id}`,
        params, // هنا تبعت الـ query params
      }),
    }),
    getProjectStatistics: builder.query({
      query: ({ userId }) => ({
        url: "api/orders/orders-statistics",
        params: { userId },
      }),
    }),

    ProviderProjectState: builder.mutation({
      query: (body) => ({
        url: "api/orders/provider-order-update-status",
        method: "PUT",
        body,
      }),
    }),
    addOrderAttachments: builder.mutation({
      query: ({ body, projectId }) => ({
        url: `api/orders/add-order-attachments/${projectId}`,
        method: "PUT",
        body,
      }),
    }),
    completeOrder: builder.mutation({
      query: ({ body, projectId }) => ({
        url: `api/orders/complete-order/${projectId}`,
        method: "PUT",
        body,
      }),
    }),
    // Delete Project/Order
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `api/orders/${id}`,
        method: "DELETE",
      }),
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
