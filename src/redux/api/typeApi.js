import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const lookupApi = createApi({
  reducerPath: "lookupApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["LookupTypes", "LookupValues"],
  endpoints: (builder) => ({
    // Get All Lookup Types
    getLookupTypes: builder.query({
      query: () => ({
        table: "lookup_types",
        method: "GET",
      }),
      providesTags: ["LookupTypes"],
    }),
    // Get Lookup Values by Type Code
    getLookupValuesByType: builder.query({
      query: (typeCode) => ({
        table: "lookup_values",
        method: "GET",
        filters: {
          // We need to join with lookup_types to filter by code
        },
        joins: [
          "lookup_type:lookup_types!inner(id,code,name_ar,name_en)",
        ],
      }),
      providesTags: ["LookupValues"],
    }),
    // Get Lookup Values by Type ID
    getLookupValues: builder.query({
      query: (typeId) => ({
        table: "lookup_values",
        method: "GET",
        filters: {
          lookup_type_id: typeId,
        },
      }),
      providesTags: ["LookupValues"],
    }),
  }),
});

export const {
  useGetLookupTypesQuery,
  useGetLookupValuesByTypeQuery,
  useGetLookupValuesQuery,
} = lookupApi;
