// example: pages/OrdersTable.jsx

import { Link, useSearchParams } from "react-router-dom";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useGetRequestersAccountsQuery } from "../../../redux/api/requestersApi";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";

const RequestersTable = ({ stats }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const [searchParams] = useSearchParams();

  // استخراج القيم من الـ URL
  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const AccountStatus = searchParams.get("AccountStatus") || "";
  const totalRows = (() => {
    if (AccountStatus === "200") return stats?.pendingAccountsCount || 0;
    if (AccountStatus === "201") return stats?.activeAccountsCount || 0;
    if (AccountStatus === "202") return stats?.blockedAccountsCount || 0;
    if (AccountStatus === "203") return stats?.suspendedAccountsCount || 0;
    return stats?.totalAccountsCount || 0;
  })();
  const {
    data: requestrs,
    isLoading,
    refetch,
  } = useGetRequestersAccountsQuery({
    PageNumber,
    PageSize,
    AccountStatus,
  });

  useEffect(() => {
    refetch();
  }, [PageNumber, PageSize, AccountStatus]);

  const tabs = [
    {
      name: t("requestersTable.tabs.all"),
      href: "",
      numbers: stats?.totalAccountsCount,
      color: "#637381",
    },
    {
      name: t("requestersTable.tabs.active"),
      href: "?AccountStatus=201",
      numbers: stats?.activeAccountsCount,

      color: "#007867",
    },
    {
      name: t("requestersTable.tabs.pending"),
      href: "?AccountStatus=200",
      numbers: stats?.pendingAccountsCount,
      color: "#B76E00",
    },
    {
      name: t("requestersTable.tabs.suspended"),
      href: "?AccountStatus=203",
      numbers: stats?.suspendedAccountsCount,
      color: "#b76f21",
    },
    {
      name: t("requestersTable.tabs.blocked"),
      href: "?AccountStatus=202",
      numbers: stats?.blockedAccountsCount,
      color: "#B71D18",
    },
  ];
  const columns = [
    {
      name: t("requestersTable.columns.name"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row.name}
        </span>
      ),
    },
    {
      name: t("requestersTable.columns.entityType"),
      selector: (row) =>
        lang === "ar" ? row.entityType?.nameAr : row.entityType?.nameEn,
      wrap: true,
    },
    {
      name: t("requestersTable.columns.email"),
      selector: (row) => row.email,
      sortable: true,
      wrap: true,
    },
    {
      name: t("requestersTable.columns.phone"),
      selector: (row) => row.phoneNumber,
      wrap: true,
    },
    {
      name: t("requestersTable.columns.region"),
      selector: (row) => (lang === "ar" ? row.city?.nameAr : row.city?.nameEn),
      wrap: true,
    },
    {
      name: t("requestersTable.columns.status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${
                row.profileStatus?.id === 201
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                  : row.profileStatus?.id === 202
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
        >
          {lang === "ar"
            ? row.profileStatus?.nameAr
            : row.profileStatus?.nameEn}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("requestersTable.columns.action"),
      cell: (row) => (
        <Link
          to={`/admin/requesters/${row.id}`}
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

  return (
    <div className="py-5">
      <div className="mx-2">
        <div className="rounded-3xl bg-white p-5">
          <CustomDataTable
            tabs={tabs}
            columns={columns}
            data={requestrs}
            searchableFields={["name", "email", "phoneNumber"]}
            searchPlaceholder={t("searchPlaceholder")}
            defaultPage={PageNumber}
            defaultPageSize={PageSize}
            isLoading={isLoading}
            totalRows={totalRows} // 👈 لازم ده عشان الباجينيشن يعرف عدد الصفوف
          />
        </div>
      </div>
    </div>
  );
};

export default RequestersTable;
