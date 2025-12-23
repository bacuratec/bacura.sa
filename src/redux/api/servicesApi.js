import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Services"],
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => ({
        table: "services",
        method: "GET",
      }),
      providesTags: ["Services"],
    }),
    getService: builder.query({
      query: (id) => ({
        table: "services",
        method: "GET",
        id,
      }),
      providesTags: ["Services"],
    }),
    createService: builder.mutation({
      query: (body) => ({
        table: "services",
        method: "POST",
        body: {
          name_ar: body.titleAr,
          name_en: body.titleEn,
          description: body.description || null,
          base_price: body.price || null,
          is_active: body.isActive !== undefined ? body.isActive : true,
        },
      }),
      invalidatesTags: ["Services"],
    }),
    updateService: builder.mutation({
      query: ({ id, body }) => ({
        table: "services",
        method: "PUT",
        id,
        body: {
          name_ar: body.titleAr,
          name_en: body.titleEn,
          description: body.description || null,
          base_price: body.price || null,
          is_active: body.isActive !== undefined ? body.isActive : true,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Services"],
    }),
    ActiveServiceStatus: builder.mutation({
      query: ({ id }) => ({
        table: "services",
        method: "PUT",
        id,
        body: {
          is_active: true,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Services"],
    }),
    deActiveServiceStatus: builder.mutation({
      query: ({ id }) => ({
        table: "services",
        method: "PUT",
        id,
        body: {
          is_active: false,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Services"],
    }),
    updateServicePrice: builder.mutation({
      query: ({ id, body }) => ({
        table: "services",
        method: "PUT",
        id,
        body: {
          base_price: body.price,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Services"],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        table: "services",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Services"],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useActiveServiceStatusMutation,
  useDeActiveServiceStatusMutation,
  useUpdateServicePriceMutation,
  useDeleteServiceMutation,
} = servicesApi;
