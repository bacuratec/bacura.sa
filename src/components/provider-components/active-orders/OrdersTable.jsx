import Link from "next/link";
import { useSearchParams } from "@/utils/useSearchParams";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import { useGetProjectsQuery } from "../../../redux/api/projectsApi";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";

const OrdersTable = () => {
  const { lang } = useContext(LanguageContext);

  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const searchParams = useSearchParams();
  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const OrderStatusLookupId = searchParams.get("OrderStatusLookupId") || "";

  const {
    data: projects,
    isLoading,
    refetch,
  } = useGetProjectsQuery({
    PageNumber,
    PageSize,
    OrderStatusLookupId: 600,
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, OrderStatusLookupId]);

  const columns = [
    {
      name: t("orders.columns.orderNumber"),
      cell: (row) => (
        <span className="rounded-lg text-xs text-blue-600 font-normal">
          {row?.orderNumber}
        </span>
      ),
    },
    {
      name: t("orders.columns.requester"),
      selector: (row) => row?.requester?.fullName || t("unknown") || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.provider"),
      selector: (row) => row?.providers?.fullName || t("unknown") || "-",
      wrap: true,
    },
    {
      name: t("projects.serviceType"),
      selector: (row) =>
        lang === "ar"
          ? row?.services?.[0]?.titleAr || "-"
          : row?.services?.[0]?.titleEn || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.startDate"),
      selector: (row) =>
        row?.startDate ? dayjs(row.startDate).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("orders.columns.endDate"),
      selector: (row) =>
        row?.endDate ? dayjs(row.endDate).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },

    {
      name: t("orders.columns.status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
            ${
              row?.orderStatus?.id === 603
                ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                : row?.orderStatus?.id === 602
                ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                : row?.orderStatus?.id === 605 || row?.orderStatus?.id === 604
                ? "bg-red-100 text-red-700"
                : row?.orderStatus?.id === 601
                ? "bg-red-100 text-[#B76E00]"
                : "bg-gray-100 text-gray-600"
            }`}
        >
          {lang === "ar"
            ? row?.orderStatus?.nameAr || "-"
            : row?.orderStatus?.nameEn || "-"}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("orders.columns.action"),
      cell: (row) => (
        <Link
          href={
            role === "Admin"
              ? `/admin/projects/${row.id}`
              : role === "Requester"
              ? `/projects/${row.id}`
              : `/provider/projects/${row.id}`
          }
          className="bg-[#1A71F6] text-white px-1 py-1 rounded-xl hover:bg-blue-700 transition text-xs font-medium ml-5 text-nowrap"
        >
          <Eye />
        </Link>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const filteredProjects =
    OrderStatusLookupId === ""
      ? projects?.filter((item) => item.orderStatus?.id === 600)
      : projects;

  const sortedData = filteredProjects
    ? [...filteredProjects]?.sort((a, b) => {
        return Number(b?.orderNumber) - Number(a?.orderNumber);
      })
    : [];

  return (
    <div className="py-5">
      <div className="container">
        <div className="rounded-3xl bg-white p-5">
          <CustomDataTable
            columns={columns}
            data={sortedData}
            searchableFields={["orderNumber"]}
            searchPlaceholder={t("searchPlaceholder")}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
