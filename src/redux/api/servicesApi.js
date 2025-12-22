import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { jwtDecode } from "jwt-decode";
import { logout } from "../slices/authSlice";
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
export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    prepareHeaders: (headers, { getState, dispatch }) => {
      const lang = localStorage.getItem("lang");
      if (lang) {
        headers.set("lang", lang);
        headers.set("accept-language", lang);
      }
      // أضف التوكن للـ Authorization header
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => "api/services",
    }),
    ActiveServiceStatus: builder.mutation({
      query: ({ body, id }) => ({
        url: `api/services/activate/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deActiveServiceStatus: builder.mutation({
      query: ({ body, id }) => ({
        url: `api/services/deactivate/${id}`,
        method: "PUT",
        body,
      }),
    }),
    updateServicePrice: builder.mutation({
      query: ({ body, id }) => ({
        url: `api/services/update-service-price/${id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetServicesQuery,
  useActiveServiceStatusMutation,
  useDeActiveServiceStatusMutation,
  useUpdateServicePriceMutation,
} = servicesApi;
