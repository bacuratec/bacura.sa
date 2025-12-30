import { createApi } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabaseClient";

// Custom base query for statistics that need complex aggregations
const statisticsBaseQuery = async (args) => {
  const { type, filters = {} } = args;

  try {
    let result;

    switch (type) {
      case "requesters": {
        // Count requesters, active/inactive
        const [totalRequesters, activeRequesters] = await Promise.all([
          supabase.from("requesters").select("id", { count: "exact", head: true }),
          supabase
            .from("requesters")
            .select("id", { count: "exact", head: true })
            .eq("users!requesters_user_id_fkey.is_blocked", false),
        ]);
        result = {
          totalRequestersCount: totalRequesters.count || 0,
          activeRequestersCount: activeRequesters.count || 0,
          inactiveRequestersCount: (totalRequesters.count || 0) - (activeRequesters.count || 0),
        };
        break;
      }

      case "providers": {
        const [
          total,
          pending,
          active,
          blocked,
          suspended
        ] = await Promise.all([
          supabase.from("providers").select("id", { count: "exact", head: true }),
          supabase.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 200),
          supabase.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 201),
          supabase.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 202),
          supabase.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 203),
        ]);
        
        result = {
          totalAccountsCount: total.count || 0,
          pendingAccountsCount: pending.count || 0,
          activeAccountsCount: active.count || 0,
          blockedAccountsCount: blocked.count || 0,
          suspendedAccountsCount: suspended.count || 0,
        };
        break;
      }

      case "requests": {
        // Count requests by status
        // Mapped to DB IDs: 7=pending, 8=priced, 9=accepted, 10=rejected, 11=completed
        const [
          total,
          processing,
          initialApproval,
          waitingPayment,
          rejected,
          completed,
          newRequests
        ] = await Promise.all([
          supabase.from("requests").select("id", { count: "exact", head: true }),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 8), // Priced
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 9), // Accepted
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 21), // Waiting Payment (Was 0, now 21)
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 10), // Rejected
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 11), // Completed
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 7), // Pending
        ]);

        result = {
          totalRequestsCount: total.count || 0,
          underProcessingRequestsCount: processing.count || 0,
          initiallyApprovedRequestsCount: initialApproval.count || 0,
          waitingForPaymentRequestsCount: waitingPayment.count || 0,
          rejectedRequestsCount: rejected.count || 0,
          approvedRequestsCount: completed.count || 0,
          newRequestsCount: newRequests.count || 0,
        };
        break;
      }

      case "admin": {
        // Platform-wide statistics
        const [
          usersCount,
          requestersCount,
          providersCount,
          requestsCount,
          ordersCount,
          paymentsCount,
          projectsCount,
          ticketsCount,
        ] = await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("requesters").select("id", { count: "exact", head: true }),
          supabase.from("providers").select("id", { count: "exact", head: true }),
          supabase.from("requests").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase
            .from("payments")
            .select("amount", { count: "exact", head: false }),
          supabase.from("orders").select("id", { count: "exact", head: true }), // Fixed: projects -> orders
          supabase.from("tickets").select("id", { count: "exact", head: true }),
        ]);

        const totalAmount =
          paymentsCount.data?.reduce(
            (sum, row) => sum + Number(row.amount || 0),
            0
          ) || 0;

        result = {
          totalUsers: usersCount.count || 0,
          totalRequesters: requestersCount.count || 0,
          totalProviders: providersCount.count || 0,
          totalRequests: requestsCount.count || 0,
          totalOrders: ordersCount.count || 0,
          totalProjects: projectsCount.count || 0,
          totalTickets: ticketsCount.count || 0,
          totalFinancialAmounts: totalAmount,
          consultationsFinancialAmounts: 0,
        };
        break;
      }

      case "providerOrders": {
        // Provider-specific order statistics
        const providerOrders = await supabase
          .from("orders")
          .select("order_status_id", { count: "exact" })
          .eq("provider_id", filters.providerId);
        result = {
          totalOrders: providerOrders.count || 0,
        };
        break;
      }

      default:
        throw new Error(`Unknown statistics type: ${type}`);
    }

    return { data: result };
  } catch (error) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        data: error,
        message: error.message || "An error occurred",
      },
    };
  }
};

export const adminStatisticsApi = createApi({
  reducerPath: "adminStatisticsApi",
  baseQuery: statisticsBaseQuery,
  tagTypes: ["Statistics"],
  endpoints: (builder) => ({
    getRequestersStatistics: builder.query({
      query: () => ({
        type: "requesters",
      }),
      providesTags: ["Statistics"],
    }),
    getServiceProvidersStatistics: builder.query({
      query: () => ({
        type: "providers",
      }),
      providesTags: ["Statistics"],
    }),
    getRequestsStatistics: builder.query({
      query: () => ({
        type: "requests",
      }),
      providesTags: ["Statistics"],
    }),
    getAdminStatistics: builder.query({
      query: () => ({
        type: "admin",
      }),
      providesTags: ["Statistics"],
    }),
    getProviderOrderStatistics: builder.query({
      query: ({ providerId }) => ({
        type: "providerOrders",
        filters: { providerId },
      }),
      providesTags: ["Statistics"],
    }),
  }),
});

export const {
  useGetRequestersStatisticsQuery,
  useGetServiceProvidersStatisticsQuery,
  useGetRequestsStatisticsQuery,
  useGetAdminStatisticsQuery,
  useGetProviderOrderStatisticsQuery,
} = adminStatisticsApi;
