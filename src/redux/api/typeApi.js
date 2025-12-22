// src/services/lookupApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const lookupApi = createApi({
  reducerPath: "lookupApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_APP_BASE_URL }),
  endpoints: (builder) => ({
    getRequesterEntityTypes: builder.query({
      query: () => "api/lookup-types/requester-entity-types",
    }),
    getProviderEntityTypes: builder.query({
      query: () => "api/lookup-types/provider-entity-types",
    }),
  }),
});

export const {
  useGetRequesterEntityTypesQuery,
  useGetProviderEntityTypesQuery,
} = lookupApi;
