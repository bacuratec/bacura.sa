import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";
import { jwtDecode } from "jwt-decode";
import ReassignRequest from "../../components/admin-components/projects/ReassignRequest";

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
export const ticketApi = createApi({
  reducerPath: "ticketApi",
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
    createTickets: builder.mutation({
      query: (body) => ({
        url: "api/tickets",
        method: "POST",
        body,
      }),
      // عادة لا نريد أوتو تسجيل بعد التسجيل؛ يمكن إعادة التوجيه للصفحة login
    }),
    // لو فيه endpoint لفحص صلاحية التوكن أو استعادة بيانات المستخدم:
    getTickets: builder.query({
      query: () => ({
        url: "api/tickets", // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
        // params: { PageNumber, PageSize, RequestStatus },
      }),
    }),

    getTicketDetails: builder.query({
      query: (id) => ({
        url: `/api/tickets/${id}`, // مثال، لو الAPI بترجع بيانات المستخدم
        method: "GET",
        // params: { PageNumber, PageSize, RequestStatus },
      }),
    }),

    UpdateTicketStatus: builder.mutation({
      query: ({ body, id }) => ({
        url: `api/tickets/update-ticket-status/${id}`,
        method: "PUT",
        body: JSON.stringify(body), // لازم تبعت الرقم كـ JSON
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useCreateTicketsMutation,
  useGetTicketsQuery,
  useGetTicketDetailsQuery,
  useUpdateTicketStatusMutation,
} = ticketApi;
