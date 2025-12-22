import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileInfoApi = createApi({
  reducerPath: "profileInfoApi",
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
    createProfileInfo: builder.mutation({
      query: (body) => ({
        url: "api/profile-info",
        method: "POST",
        body,
      }),
    }),
    // لو فيه endpoint لفحص صلاحية التوكن أو استعادة بيانات المستخدم:
    getProfileInfo: builder.query({
      query: () => ({
        url: "api/profile-info", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
      }),
    }),

    downloadProfileInfo: builder.query({
      query: (id) => ({
        url: `/attachments/download/${id}`, // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
        // params: { PageNumber, PageSize, RequestStatus },
      }),
    }),
  }),
});

export const {
  useCreateProfileInfoMutation,
  useGetProfileInfoQuery,
  useDownloadProfileInfoQuery,
} = profileInfoApi;
