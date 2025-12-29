import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const OrderStatusLookupId = rawStatus === 600 ? "" : rawStatus;

  const totalRows = (() => {
    if (!stats) return 0;
    if (rawStatus === "601") return stats?.waitingToStartOrdersCount || 0;
    if (rawStatus === "602") return stats?.ongoingOrdersCount || 0;
    if (rawStatus === "603") return stats?.completedOrdersCount || 0;
    if (rawStatus === "604") return stats?.rejectedOrdersCount || 0;
    if (rawStatus === "605") return stats?.serviceCompletedOrdersCount || 0;
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
      href: "?OrderStatusLookupId=600",
      numbers: stats?.waitingForApprovalOrdersCount,
      color: "#B76E00",
    },
    {
      name: t("orders.tabs.waitingToStart"),
      href: "?OrderStatusLookupId=601",
      numbers: stats?.waitingToStartOrdersCount,
      color: "#B76E00",
    },
    {
      name: t("orders.tabs.ongoing"),
      href: "?OrderStatusLookupId=602",
      numbers: stats?.ongoingOrdersCount,
      color: "#b76f21",
    },
    {
      name: t("orders.tabs.completedService"),
      href: "?OrderStatusLookupId=606",
      numbers: stats?.serviceCompletedOrdersCount,
      color: "#007867",
    },
    {
      name: t("orders.tabs.finished"),
      href: "?OrderStatusLookupId=603",
      numbers: stats?.completedOrdersCount,
      color: "#007867",
    },
    {
      name: t("orders.tabs.rejected"),
      href: "?OrderStatusLookupId=604",
      numbers: stats?.rejectedOrdersCount,
      color: "#B71D18",
    },
    {
      name: t("orders.tabs.expired"),
      href: "?OrderStatusLookupId=605",
      numbers: stats?.expiredOrdersCount,
      color: "#B71D18",
    },
  ];

  const columns = [
    {
      name: t("orders.columns.orderNumber"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row?.orderNumber}
        </span>
      ),
    },
    {
      name: t("orders.columns.requester"),
      selector: (row) => row.requester.fullName,
      wrap: true,
    },
    {
      name: t("orders.columns.provider"),
      selector: (row) => row.providers.fullName,
      wrap: true,
    },
    {
      name: t("projects.serviceType"),
      selector: (row) =>
        lang === "ar" ? row.services[0].titleAr : row.services[0].titleEn,
      wrap: true,
    },
    {
      name: t("orders.columns.startDate"),
      selector: (row) => dayjs(row.startDate).format("DD/MM/YYYY hh:mm A"),
      wrap: true,
    },
    {
      name: t("orders.columns.endDate"),
      selector: (row) => dayjs(row.endDate).format("DD/MM/YYYY hh:mm A"),
      wrap: true,
    },
    {
      name: t("services.price"),
      selector: (row) => formatCurrency(row.request?.service?.base_price, lang),
      wrap: true,
      sortable: true,
    },
    {
      name: t("orders.columns.status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${
                row.orderStatus?.id === 603
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                  : row.orderStatus?.id === 602
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                  : row.orderStatus?.id === 605 || row.orderStatus?.id === 604
                  ? "bg-red-100 text-red-700"
                  : row.orderStatus?.id === 601
                  ? "bg-red-100 text-[#B76E00]"
                  : "bg-gray-100 text-gray-600"
              }`}
        >
          {lang === "ar" ? row.orderStatus?.nameAr : row.orderStatus?.nameEn}
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
                : `/provider/projects/${row.id}?IsRejected=${
                    row?.orderStatus?.id === 604 ? true : false
                  }&IsExpired=${row?.orderStatus?.id === 605 ? true : false}`
            }
            className="bg-[#1A71F6] text-white px-1 py-1 rounded-xl hover:bg-blue-700 transition text-xs font-medium ml-5 text-nowrap"
          >
            <Eye />
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  const filteredProjects =
    OrderStatusLookupId === ""
      ? projects?.filter((item) => item.orderStatus?.id !== 600)
      : projects;

  const sortedData = filteredProjects
    ? [...filteredProjects]?.sort(
        (a, b) => Number(b?.orderNumber) - Number(a?.orderNumber)
      )
    : [];

  return (
    <div className="py-5">
      <div className="container">
        <div className="rounded-3xl bg-white p-5">
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
  );
};

export default ProjectsList;
