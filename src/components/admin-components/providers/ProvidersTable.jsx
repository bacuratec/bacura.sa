// example: pages/OrdersTable.jsx

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useGetProvidersAccountsQuery,
  useDeleteProviderMutation,
} from "../../../redux/api/providersApi";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Edit, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

const ProvidersTable = ({ stats }) => {
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
    data: providers,
    isLoading,
    refetch,
  } = useGetProvidersAccountsQuery({
    PageNumber,
    PageSize,
    AccountStatus,
  });

  const [deleteProvider, { isLoading: isDeleting }] =
    useDeleteProviderMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, AccountStatus]);

  const askToDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteProvider(selectedId).unwrap();
      toast.success(t("providers.deleteSuccess") || "تم حذف مزود الخدمة بنجاح");
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || t("providers.deleteError") || "فشل حذف مزود الخدمة"
      );
    }
  };
  const tabs = [
    {
      name: t("providersTable.tabs.all"),
      href: "",
      numbers: stats?.totalAccountsCount,
      color: "#637381",
    },
    {
      name: t("providersTable.tabs.active"),
      href: "?AccountStatus=201",
      numbers: stats?.activeAccountsCount,

      color: "#007867",
    },
    {
      name: t("providersTable.tabs.pending"),
      href: "?AccountStatus=200",
      numbers: stats?.pendingAccountsCount,
      color: "#B76E00",
    },
    {
      name: t("providersTable.tabs.suspended"),
      href: "?AccountStatus=203",
      numbers: stats?.suspendedAccountsCount,
      color: "#b76f21",
    },
    {
      name: t("providersTable.tabs.blocked"),
      href: "?AccountStatus=202",
      numbers: stats?.blockedAccountsCount,
      color: "#B71D18",
    },
  ];

  const columns = [
    {
      name: t("providersTable.columns.name"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row.name}
        </span>
      ),
    },
    {
      name: t("providersTable.columns.entityType"),
      selector: (row) =>
        lang === "ar" ? row.entityType?.nameAr : row.entityType?.nameEn,
      wrap: true,
    },
    {
      name: t("providersTable.columns.email"),
      selector: (row) => row.email,
      sortable: true,
      wrap: true,
    },
    {
      name: t("providersTable.columns.phone"),
      selector: (row) => row.phoneNumber,
      wrap: true,
    },
    {
      name: t("providersTable.columns.region"),
      selector: (row) => (lang === "ar" ? row.city?.nameAr : row.city?.nameEn),
      wrap: true,
    },
    {
      name: t("providersTable.columns.status"),
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
      name: t("providersTable.columns.action") || "الإجراءات",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/providers/${row.id}`}
            className="bg-[#1A71F6] text-white px-1 py-1 rounded-xl hover:bg-blue-700 transition text-xs font-medium text-nowrap"
            title={t("providers.view") || "عرض"}
          >
            <Eye />
          </Link>
          <Link
            to={`/admin/providers/${row.id}`}
            className="bg-primary text-white px-1 py-1 rounded-lg hover:bg-primary/90 transition text-xs font-medium"
            title={t("providers.edit") || "تعديل"}
          >
            <Edit width={15} />
          </Link>
          <button
            onClick={() => askToDelete(row.id)}
            className="bg-red-500 text-white px-1 py-1 rounded-lg hover:bg-red-600 transition text-xs font-medium"
            title={t("providers.delete") || "حذف"}
          >
            <Trash width={15} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <>
      <div className="py-5">
        <div className="mx-2">
          <div className="rounded-3xl bg-white p-5">
            <CustomDataTable
              tabs={tabs}
              columns={columns}
              data={providers}
              searchableFields={["name", "email", "phoneNumber"]}
              searchPlaceholder={t("searchPlaceholder")}
              defaultPage={PageNumber}
              defaultPageSize={PageSize}
              isLoading={isLoading}
              totalRows={totalRows} // 👈 دي المهمة
            />
          </div>
        </div>
      </div>

      <ModalDelete
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedId(null);
        }}
        onConfirm={onDelete}
        loading={isDeleting}
      />
    </>
  );
};

export default ProvidersTable;
