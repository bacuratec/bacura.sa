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
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "Requester"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "Requester")
            .eq("is_blocked", false),
        ]);
        result = {
          totalRequestersCount: totalRequesters.count || 0,
          activeRequestersCount: activeRequesters.count || 0,
          inactiveRequestersCount: (totalRequesters.count || 0) - (activeRequesters.count || 0),
        };
        break;
      }

      case "providers": {
        const [totalProviders, activeProviders] = await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "Provider"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "Provider")
            .eq("is_blocked", false),
        ]);
        result = {
          totalProvidersCount: totalProviders.count || 0,
          activeProvidersCount: activeProviders.count || 0,
          inactiveProvidersCount: (totalProviders.count || 0) - (activeProviders.count || 0),
        };
        break;
      }

      case "requests": {
        // Count requests by status
        const requestsCountResult = await supabase
          .from("requests")
          .select("status_id", { count: "exact" });
        // Group by status would need RPC or manual processing
        result = {
          totalRequests: requestsCountResult.count || 0,
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
        ] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "Requester"),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "Provider"),
          supabase.from("requests").select("id", { count: "exact", head: true }),
          supabase.from("projects").select("id", { count: "exact", head: true }),
        ]);

        // Payments table might not exist or schema is different. Returning 0 for now.
        const totalAmount = 0;

        result = {
          totalUsers: usersCount.count || 0,
          totalRequesters: requestersCount.count || 0,
          totalProviders: providersCount.count || 0,
          totalRequests: requestsCount.count || 0,
          totalOrders: ordersCount.count || 0,
          totalFinancialAmounts: totalAmount,
          consultationsFinancialAmounts: 0, 
        };
        break;
      }

      case "providerOrders": {
        // Provider-specific order statistics
        const providerOrders = await supabase
          .from("projects")
          .select("status_id", { count: "exact" })
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
