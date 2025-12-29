// example: pages/OrdersTable.jsx

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import { useGetCitiesQuery } from "@/redux/api/citiesApi";
import { useGetServicesQuery } from "@/redux/api/servicesApi";
import { useNavigate } from "@/utils/useNavigate";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useGetUserOrdersQuery } from "../../../redux/api/ordersApi";
import dayjs from "dayjs";

import { TablePageSkeleton } from "../../shared/skeletons/PageSkeleton";

const ExploreRequests = ({ stats }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const searchParams = useSearchParams();
  // ... existing code ...

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserOrdersQuery({
    PageNumber,
    PageSize,
    RequestStatus,
    CityId,
    ServiceId,
  });

  const { data: cities, isLoading: citiesLoading } = useGetCitiesQuery();
  const { data: services, isLoading: servicesLoading } = useGetServicesQuery();
  const navigate = useNavigate();
  const [dynamicTotal, setDynamicTotal] = useState(null);

  const onFilterChange = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("PageNumber", 1);
    navigate(`${window.location.pathname}?${params.toString()}`);
  };

  const activeCity = (cities || []).find((c) => String(c.id) === String(CityId));
  const activeService = (services || []).find((s) => String(s.id) === String(ServiceId));

  const totalRows = (() => {
    if (RequestStatus === "500") return stats?.underProcessingRequestsCount || 0;
    if (RequestStatus === "501") return stats?.initiallyApprovedRequestsCount || 0;
    if (RequestStatus === "502") return stats?.waitingForPaymentRequestsCount || 0;
    if (RequestStatus === "503") return stats?.rejectedRequestsCount || 0;
    if (RequestStatus === "504") return stats?.approvedRequestsCount || 0;
    if (RequestStatus === "505") return stats?.newRequestssCount || 0;
    return stats?.totalRequestsCount || 0;
  })();

  // Dynamic count that respects CityId/ServiceId filters
  React.useEffect(() => {
    let mounted = true;
    const loadCount = async () => {
      try {
        if (!supabase) {
          setDynamicTotal(null);
          return;
        }
        let query = supabase.from("requests").select("*", { count: "exact", head: true });
        if (RequestStatus) query = query.eq("status_id", RequestStatus);
        if (CityId) query = query.eq("city_id", CityId);
        if (ServiceId) query = query.eq("service_id", ServiceId);
        const { count, error } = await query;
        if (error) {
          setDynamicTotal(null);
          return;
        }
        if (!mounted) return;
        setDynamicTotal(count ?? null);
      } catch {
        setDynamicTotal(null);
      }
    };
    loadCount();
    return () => {
      mounted = false;
    };
  }, [RequestStatus, CityId, ServiceId]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, RequestStatus]);

  if (isLoading) {
    return <TablePageSkeleton />;
  }

  const tabs = [
    {
      name: t("requestsUser.status_all"),
      href: "",
      numbers: stats?.totalRequestsCount,
      color: "#637381",
    },
    {
      name: t("requestsUser.status_new"),
      href: "?RequestStatus=505",
      numbers: stats?.newRequestssCount,
      color: "#B76E00",
    },
    {
      name: t("requestsUser.status_processing"),
      href: "?RequestStatus=500",
      numbers: stats?.underProcessingRequestsCount,
      color: "#B76E00",
    },
    {
      name: t("requestsUser.status_initial_approval"),
      href: "?RequestStatus=501",
      numbers: stats?.initiallyApprovedRequestsCount,

      color: "#007867",
    },
    {
      name: t("requestsUser.status_waiting_payment"),
      href: "?RequestStatus=502",
      numbers: stats?.waitingForPaymentRequestsCount,
      color: "#b76f21",
    },
    {
      name: t("requestsUser.status_rejected"),
      href: "?RequestStatus=503",
      numbers: stats?.rejectedRequestsCount,
      color: "#B71D18",
    },
    {
      name: t("requestsUser.status_completed"),
      href: "?RequestStatus=504",
      numbers: stats?.approvedRequestsCount,
      color: "#007867",
    },
  ];
  const columns = [
    {
      name: t("requestsUser.request_number"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row?.requestNumber}
        </span>
      ),
    },
    {
      name: t("projects.serviceType"),
      selector: (row) =>
        lang === "ar" ? row.services[0].titleAr : row.services[0].titleEn,
      wrap: true,
    },
    {
      name: t("requestsUser.requester_name"),
      selector: (row) => row.fullName,
      wrap: true,
    },
    {
      name: t("requestsUser.request_date"),
      selector: (row) => dayjs(row.creationTime).format("DD/MM/YYYY hh:mm A"),
      wrap: true,
    },
    {
      name: t("requestsUser.request_status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${
                row.requestStatus?.id === 504
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                  : row.requestStatus?.id === 501
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                  : row.requestStatus?.id === 503
                  ? "bg-red-100 text-red-700"
                  : row.requestStatus?.id === 502
                  ? "bg-red-100 text-[#B76E00]"
                  : "bg-gray-100 text-gray-600"
              }`}
        >
          {lang === "ar"
            ? row.requestStatus?.nameAr
            : row.requestStatus?.nameEn}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("requestsUser.action"),
      cell: (row) => (
        <div className="flex items-center gap-2 mt-4 justify-end">
          <Link
            href={`/requests/${row.id}`}
            className="bg-[#1A71F6] text-white px-1 py-1 rounded-xl hover:bg-blue-700 transition text-xs font-medium ml-5 text-nowrap"
          >
            <Eye />
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];
  const sortedData = orders
    ? [...orders]?.sort((a, b) => {
        // لو رقم الطلب عبارة عن أرقام
        return Number(b?.requestNumber) - Number(a?.requestNumber); // تنازلي
        // return Number(a.requestNumber) - Number(b.requestNumber); // تصاعدي
      })
    : [];
  return (
    <div className="py-5">
      <div className="container">
        <div className="rounded-3xl bg-white xl:p-6">
          <h3 className="font-bold text-xl mb-3">
            {t("requestsUser.my_requests")}
          </h3>
          {isError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 mb-4">
              {(error?.data?.message) || (error?.error) || t("error") || "An error occurred"}
            </div>
          )}
          <CustomDataTable
            tabs={tabs}
            columns={columns}
            data={sortedData}
            searchableFields={["fullName", "email", "requestNumber"]}
            searchPlaceholder={t("searchPlaceholder")}
            defaultPage={PageNumber}
            defaultPageSize={PageSize}
            totalRows={dynamicTotal ?? totalRows}
            isLoading={isLoading}
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="filter-city" className="block text-sm mb-1">{t("city") || "City"}</label>
              <select
                id="filter-city"
                value={CityId}
                onChange={(e) => onFilterChange("CityId", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                disabled={citiesLoading}
              >
                <option value="">{t("all") || "All"}</option>
                {citiesLoading ? (
                  <option value="">{t("loading.default")}</option>
                ) : (
                  (cities || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === "ar" ? c.name_ar : c.name_en}
                  </option>
                ))
                )}
              </select>
            </div>
            <div>
              <label htmlFor="filter-service" className="block text-sm mb-1">{t("projects.serviceType")}</label>
              <select
                id="filter-service"
                value={ServiceId}
                onChange={(e) => onFilterChange("ServiceId", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                disabled={servicesLoading}
              >
                <option value="">{t("all") || "All"}</option>
                {servicesLoading ? (
                  <option value="">{t("loading.default")}</option>
                ) : (
                  (services || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === "ar" ? s.name_ar : s.name_en}
                  </option>
                ))
                )}
              </select>
            </div>
          </div>
          {(CityId || ServiceId) && (
            <div className="mt-3">
              <div className="flex gap-2 mb-2">
                {CityId && activeCity && (
                  <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-sm">
                    {t("city")}: {lang === "ar" ? activeCity.name_ar : activeCity.name_en}
                    <button
                      type="button"
                      aria-label="remove city filter"
                      onClick={() => onFilterChange("CityId", "")}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                {ServiceId && activeService && (
                  <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-sm">
                    {t("projects.serviceType")}: {lang === "ar" ? activeService.name_ar : activeService.name_en}
                    <button
                      type="button"
                      aria-label="remove service filter"
                      onClick={() => onFilterChange("ServiceId", "")}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.delete("CityId");
                  params.delete("ServiceId");
                  params.set("PageNumber", 1);
                  navigate(`${window.location.pathname}?${params.toString()}`);
                }}
                className="text-sm bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2"
              >
                {t("clearFilters") || "Clear Filters"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreRequests;
