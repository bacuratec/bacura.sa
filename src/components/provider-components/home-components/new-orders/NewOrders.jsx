import Link from "next/link";
import CustomDataTable from "../../../shared/datatable/DataTable";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import { useGetProjectsProvidersQuery } from "@/redux/api/projectsApi";
import { useGetProviderByUserIdQuery } from "@/redux/api/usersDetails";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";

const OrdersTable = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const userId = useSelector((state) => state.auth.userId);
  const { data: providerDataResult } = useGetProviderByUserIdQuery(userId, { skip: !userId });
  const providerData = Array.isArray(providerDataResult) ? providerDataResult[0] : providerDataResult;
  const providerId = providerData?.id;

  const PageNumber = 1;
  const PageSize = 10;

  const {
    data: projects,
    isLoading,
    refetch,
  } = useGetProjectsProvidersQuery({
    PageNumber,
    PageSize,
    OrderStatusLookupId: 18, // Waiting to Start
    providerId,
  }, { skip: !providerId });

  useEffect(() => {
    if (providerId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const columns = [
    {
      name: t("orders.columns.orderNumber") || "رقم الطلب",
      cell: (row) => (
        <span className="rounded-lg text-xs text-blue-600 font-normal">
          {row?.orderNumber || row?.id?.slice?.(0, 8) || "-"}
        </span>
      ),
    },
    {
      name: t("orders.columns.requester") || "مقدم الطلب",
      selector: (row) => row.request?.requester?.name || "-",
      wrap: true,
    },
    {
      name: t("projects.serviceType") || "نوع الخدمة",
      selector: (row) =>
        lang === "ar"
          ? row.request?.service?.name_ar || "-"
          : row.request?.service?.name_en || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.startDate") || "تاريخ البدء",
      selector: (row) => row.created_at ? dayjs(row.created_at).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("orders.columns.status") || "الحالة",
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${row.status?.id === 15
              ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
              : row.status?.id === 13
                ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                : row.status?.id === 19 || row.status?.id === 20
                  ? "bg-red-100 text-red-700"
                  : row.status?.id === 18
                    ? "bg-amber-100 text-[#B76E00]"
                    : "bg-gray-100 text-gray-600"
            }`}
        >
          {lang === "ar" ? row.status?.name_ar : row.status?.name_en}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("orders.columns.action") || "الإجراءات",
      cell: (row) => (
        <Link
          href={`/provider/projects/${row.id}`}
          className="bg-[#1A71F6] text-white px-2 py-2 rounded-xl hover:bg-blue-700 transition text-xs font-medium flex items-center justify-center whitespace-nowrap"
        >
          <Eye size={16} />
        </Link>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  const sortedData = Array.isArray(projects)
    ? [...projects]?.sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix())
    : (projects?.data ? [...projects.data]?.sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix()) : []);

  return (
    <div className="py-5">
      <div className="container">
        <div className="rounded-3xl bg-white p-5">
          <CustomDataTable
            columns={columns}
            data={sortedData}
            searchableFields={["id"]}
            searchPlaceholder={t("searchPlaceholder") || "بحث برقم الطلب..."}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
