import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials } from "../slices/authSlice";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

// للتعامل مع انتهاء التوكن
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

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
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
    refreshToken: builder.mutation({
      query: ({ refreshToken, token }) => ({
        url: "api/token/refresh",
        method: "POST",
        body: { refreshToken },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;

          // استخدم JSON.parse علشان تحول من string إلى object
          const fromStorage = localStorage.getItem("auth");
          const currentAuth = fromStorage
            ? JSON.parse(fromStorage)
            : getState().auth;

          dispatch(
            setCredentials({
              token: data.accessToken,
              refreshToken: data.refreshToken,
              role: currentAuth.role,
              userId: currentAuth.userId,
            })
          );
        } catch (err) {
          console.error("Failed to refresh token:", err);
          // dispatch(logout());
        }
      },
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "api/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // بعد نجاح login، خزّن التوكن والrole:
          dispatch(
            setCredentials({
              token: data.accessToken,
              refreshToken: data.refreshToken,

              role: data.role,
              userId: data.userId,
            })
          );
        } catch (err) {
          toast.error(err.error.data.Message);
          console.log(err);

          // فشل login: لا تفعل شيء إضافي، يمكن للتكويمبوننت تظهر خطأ
        }
      },
    }),
    registerProvider: builder.mutation({
      query: (body) => ({
        url: "api/auth/register-provider",
        method: "POST",
        body,
      }),
      // عادة لا نريد أوتو تسجيل بعد التسجيل؛ يمكن إعادة التوجيه للصفحة login
    }),
    registerRequester: builder.mutation({
      query: (body) => ({
        url: "api/auth/register-requester",
        method: "POST",
        body,
      }),
    }),
    // لو فيه endpoint لفحص صلاحية التوكن أو استعادة بيانات المستخدم:
    getProfile: builder.query({
      query: () => ({
        url: "api/auth/profile", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
      }),
    }),
    toggleBlockUser: builder.mutation({
      query: (id) => ({
        url: `api/auth/block-user/${id}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRefreshTokenMutation,
  useLoginMutation,
  useRegisterProviderMutation,
  useRegisterRequesterMutation,
  useGetProfileQuery,
  useToggleBlockUserMutation,
} = authApi;
