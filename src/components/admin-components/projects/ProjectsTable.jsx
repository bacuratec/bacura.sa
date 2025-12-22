import { Link, useSearchParams } from "react-router-dom";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import { useGetProjectsQuery } from "../../../redux/api/projectsApi";
import { useSelector } from "react-redux";
import AddReviewModal from "../../landing-components/add-rate/AddRateModal";
import { useTranslation } from "react-i18next";
import { EyeIcon } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";

const ProjectsTable = ({ stats }) => {
  const { lang } = useContext(LanguageContext);
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const [searchParams] = useSearchParams();

  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const OrderStatusLookupId = searchParams.get("OrderStatusLookupId") || "";
  const totalRows = (() => {
    if (OrderStatusLookupId === "600")
      return stats?.waitingForApprovalOrdersCount || 0;
    if (OrderStatusLookupId === "601")
      return stats?.waitingToStartOrdersCount || 0;
    if (OrderStatusLookupId === "602") return stats?.ongoingOrdersCount || 0;
    if (OrderStatusLookupId === "603") return stats?.completedOrdersCount || 0;
    if (OrderStatusLookupId === "604") return stats?.rejectedOrdersCount || 0;
    if (OrderStatusLookupId === "605")
      return stats?.serviceCompletedOrdersCount || 0;
    return stats?.totalOrdersCount || 0;
  })();
  const {
    data: projects,
    isLoading,
    refetch,
  } = useGetProjectsQuery({
    PageNumber,
    PageSize,
    OrderStatusLookupId,
  });

  useEffect(() => {
    refetch();
  }, [PageNumber, PageSize, OrderStatusLookupId]);

  const tabs = [
    {
      name: t("projects.all"),
      href: "",
      numbers: stats?.totalOrdersCount,
      color: "#637381",
    },
    {
      name: t("projects.waitingApproval"),
      href: "?OrderStatusLookupId=600",
      numbers: stats?.waitingForApprovalOrdersCount,
      color: "#B76E00",
    },
    {
      name: t("projects.waitingStart"),
      href: "?OrderStatusLookupId=601",
      numbers: stats?.waitingToStartOrdersCount,
      color: "#B76E00",
    },
    {
      name: t("projects.processing"),
      href: "?OrderStatusLookupId=602",
      numbers: stats?.ongoingOrdersCount,
      color: "#b76f21",
    },

    {
      name: t("projects.completed"),
      href: "?OrderStatusLookupId=606",
      numbers: stats?.serviceCompletedOrdersCount,
      color: "#007867",
    },
    {
      name: t("projects.ended"),
      href: "?OrderStatusLookupId=603",
      numbers: stats?.completedOrdersCount,
      color: "#007867",
    },
    {
      name: t("projects.rejected"),
      href: "?OrderStatusLookupId=604",
      numbers: stats?.rejectedOrdersCount,
      color: "#B71D18",
    },
    {
      name: t("projects.expired"),
      href: "?OrderStatusLookupId=605",
      numbers: stats?.expiredOrdersCount,
      color: "#B71D18",
    },
  ];

  const columns = [
    {
      name: t("projects.orderNumber"),
      cell: (row) => (
        <span className="rounded-lg text-xs text-blue-600 font-normal">
          {row?.orderNumber}
        </span>
      ),
    },
    {
      name: t("projects.requester"),
      selector: (row) => row.requester.fullName,
      wrap: true,
    },
    {
      name: t("projects.serviceType"),
      selector: (row) =>
        lang === "ar" ? row.services[0].titleAr : row.services[0].titleEn,
      wrap: true,
    },
    role === "Requester"
      ? {}
      : {
          name: t("projects.provider"),
          selector: (row) => row.providers[0]?.fullName,
          wrap: true,
        },
    {
      name: t("projects.startDate"),
      selector: (row) => dayjs(row.startDate).format("DD/MM/YYYY hh:mm A"),
      wrap: true,
    },
    {
      name: t("projects.endDate"),
      selector: (row) => dayjs(row.endDate).format("DD/MM/YYYY hh:mm A"),
      wrap: true,
    },
    {
      name: t("projects.orderStatus"),
      cell: (row) => (
        <span
          className={`px-0 py-1 rounded-lg text-[11px] font-normal
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
      name: t("projects.action"),
      cell: (row) => (
        <div className="flex flex-col py-3 gap-2">
          <Link
            to={
              role === "Admin"
                ? `/admin/projects/${row.id}`
                : role === "Requester"
                ? `/projects/${row.id}`
                : `/provider/projects/${row.id}`
            }
            className="bg-[#1A71F6] text-white px-1 py-1 rounded-lg hover:bg-blue-700 transition text-xs font-medium"
          >
            <EyeIcon />
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const sortedData = projects
    ? [...projects]?.sort(
        (a, b) => Number(b?.orderNumber) - Number(a?.orderNumber)
      )
    : [];

  return (
    <div className="py-5">
      <div className="mx-2">
        <div className="rounded-3xl bg-white p-5">
          <CustomDataTable
            tabs={tabs}
            columns={columns}
            data={sortedData}
            searchableFields={["orderNumber", "startDate", "endDate"]}
            searchPlaceholder={t("searchPlaceholder")}
            isLoading={isLoading}
            totalRows={totalRows} // 👈 الباجينيشن هيشتغل بناءً عليه
          />
          {/* <AddReviewModal open={open} setOpen={setOpen} orderId={orderId} /> */}
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;
