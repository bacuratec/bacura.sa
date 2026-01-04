import Link from "next/link";
import { useSearchParams } from "@/utils/useSearchParams";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import { useGetProjectsProvidersQuery } from "../../../redux/api/projectsApi";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import { formatCurrency } from "@/utils/currency";

const ProjectsList = ({ stats }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const role = useSelector((state) => state.auth.role);
  const searchParams = useSearchParams();

  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const rawStatus = searchParams.get("OrderStatusLookupId") || "";
  const OrderStatusLookupId = rawStatus === 17 ? "" : rawStatus;

  const totalRows = (() => {
    if (!stats) return 0;
    if (rawStatus === "18") return stats?.waitingToStartOrdersCount || 0;
    if (rawStatus === "13") return stats?.ongoingOrdersCount || 0;
    if (rawStatus === "15") return stats?.completedOrdersCount || 0;
    if (rawStatus === "19") return stats?.rejectedOrdersCount || 0;
    if (rawStatus === "20") return stats?.expiredOrdersCount || 0; // Or whatever stats maps to expired
    // stats?.serviceCompletedOrdersCount ?? maybe mapped to 15 as well?
    return stats?.totalOrdersCount || 0;
  })();

  const {
    data: projects,
    isLoading,
    refetch,
  } = useGetProjectsProvidersQuery({
    PageNumber,
    PageSize,
    OrderStatusLookupId,
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, OrderStatusLookupId]);

  const tabs = [
    {
      name: t("orders.tabs.all"),
      href: "",
      numbers: stats?.totalOrdersCount,
      color: "#637381",
    },
    {
      name: t("orders.tabs.waitingForApproval"),
      href: "?OrderStatusLookupId=17",
      numbers: stats?.waitingForApprovalOrdersCount,
      color: "#B76E00",
    },
    {
      name: t("orders.tabs.waitingToStart"),
      href: "?OrderStatusLookupId=18",
      numbers: stats?.waitingToStartOrdersCount,
      color: "#B76E00",
    },
    {
      name: t("orders.tabs.ongoing"),
      href: "?OrderStatusLookupId=13",
      numbers: stats?.ongoingOrdersCount,
      color: "#b76f21",
    },
    {
      name: t("orders.tabs.completedService"),
      // Service Completed often means provider finished but admin/user hasn't approved yet? 
      // Or status 11? 
      // In projects table, completed is 15.
      // Let's assume 15 is final, maybe there is a 'service completed' 14 (on-hold) or similar?
      // I'll stick to 15 for completed.
      href: "?OrderStatusLookupId=15",
      numbers: stats?.serviceCompletedOrdersCount,
      color: "#007867",
    },
    // Removing redundant "Finished" tab if Covered by CompletedService or vice versa
    // {
    //   name: t("orders.tabs.finished"),
    //   href: "?OrderStatusLookupId=15",
    //   numbers: stats?.completedOrdersCount,
    //   color: "#007867",
    // },
    {
      name: t("orders.tabs.rejected"),
      href: "?OrderStatusLookupId=19",
      numbers: stats?.rejectedOrdersCount,
      color: "#B71D18",
    },
    {
      name: t("orders.tabs.expired"),
      href: "?OrderStatusLookupId=20",
      numbers: stats?.expiredOrdersCount,
      color: "#B71D18",
    },
  ];

  const columns = [
    {
      name: t("orders.columns.orderNumber"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row?.orderNumber || row?.id?.substring(0, 8)}
        </span>
      ),
    },
    {
      name: t("orders.columns.requester"),
      selector: (row) => row?.requester?.name || t("unknown") || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.provider"),
      selector: (row) => row?.provider?.name || t("unknown") || "-",
      wrap: true,
    },
    {
      name: t("projects.serviceType"),
      selector: (row) =>
        lang === "ar"
          ? row?.request?.service?.name_ar || "-"
          : row?.request?.service?.name_en || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.startDate"),
      selector: (row) =>
        row?.started_at ? dayjs(row.started_at).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("orders.columns.endDate"),
      selector: (row) =>
        row?.completed_at ? dayjs(row.completed_at).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("services.price"),
      selector: (row) => {
        const amount = row?.request?.service?.base_price;
        return typeof amount === "number" ? formatCurrency(amount, lang) : "-";
      },
      wrap: true,
      sortable: true,
    },
    {
      name: t("orders.columns.status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${row?.status?.id === 15
              ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
              : row?.status?.id === 13
                ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                : row?.status?.id === 20 || row?.status?.id === 19
                  ? "bg-red-100 text-red-700"
                  : row?.status?.id === 18
                    ? "bg-red-100 text-[#B76E00]"
                    : "bg-gray-100 text-gray-600"
            }`}
        >
          {lang === "ar"
            ? row?.status?.name_ar || "-"
            : row?.status?.name_en || "-"}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("orders.columns.action"),
      cell: (row) => (
        <div className="overflow-visible">
          <Link
            href={
              role === "Admin"
                ? `/admin/projects/${row.id}`
                : role === "Requester"
                  ? `/projects/${row.id}`
                  : `/provider/projects/${row.id}?IsRejected=${row?.status?.id === 19 ? true : false
                  }&IsExpired=${row?.status?.id === 20 ? true : false}`
            }
            className="bg-[#1A71F6] text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition text-xs font-medium ml-5 text-nowrap"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  // Ensure projects is always an array
  const baseData = Array.isArray(projects) ? projects : (projects?.data || []);

  const filteredProjects =
    OrderStatusLookupId === ""
      ? baseData?.filter((item) => item.status?.id !== 17)
      : baseData;

  const sortedData = filteredProjects
    ? [...filteredProjects]?.sort(
      (a, b) => Number(b?.id?.replace(/\D/g, '')) - Number(a?.id?.replace(/\D/g, ''))
    )
    : [];

  return (
    <div className="py-8 bg-gray-50/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="glass-card p-2 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div className="bg-white rounded-[2.2rem] overflow-hidden p-6">
            <CustomDataTable
              tabs={tabs}
              columns={columns}
              data={sortedData}
              searchableFields={["orderNumber"]}
              searchPlaceholder={t("searchPlaceholder")}
              isLoading={isLoading}
              totalRows={totalRows}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;
