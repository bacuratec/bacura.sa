import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const citiesApi = createApi({
  reducerPath: "citiesApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_APP_BASE_URL }),
  endpoints: (builder) => ({
    getCities: builder.query({
      query: () => "api/lookup-types/cities",
    }),
  }),
});

export const { useGetCitiesQuery } = citiesApi;
