// example: pages/OrdersTable.jsx

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import {
  useGetRequestersAccountsQuery,
  useDeleteRequesterMutation,
} from "../../../redux/api/requestersApi";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Edit, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

const RequestersTable = ({ stats }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const searchParams = useSearchParams();

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

  const [deleteRequester, { isLoading: isDeleting }] =
    useDeleteRequesterMutation();

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
      await deleteRequester(selectedId).unwrap();
      toast.success(
        t("requesters.deleteSuccess") || "تم حذف طالب الخدمة بنجاح"
      );
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          t("requesters.deleteError") ||
          "فشل حذف طالب الخدمة"
      );
    }
  };

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
          {row.full_name}
        </span>
      ),
    },
    {
      name: t("requestersTable.columns.entityType"),
      selector: (row) =>
        lang === "ar" ? row.entity_type?.name_ar : row.entity_type?.name_en,
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
      selector: (row) => row.phone_number,
      wrap: true,
    },
    {
      name: t("requestersTable.columns.region"),
      selector: (row) => (lang === "ar" ? row.city?.name_ar : row.city?.name_en),
      wrap: true,
    },
    {
      name: t("requestersTable.columns.status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${
                !row.is_blocked && row.is_active
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                  : row.is_blocked
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
        >
          {row.is_blocked
            ? t("status.blocked") || "محظور"
            : row.is_active
            ? t("status.active") || "نشط"
            : t("status.inactive") || "غير نشط"}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("requestersTable.columns.action") || "الإجراءات",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/requesters/${row.id}`}
            className="bg-[#1A71F6] text-white px-1 py-1 rounded-xl hover:bg-blue-700 transition text-xs font-medium text-nowrap"
            title={t("requesters.view") || "عرض"}
          >
            <Eye />
          </Link>
          <Link
            href={`/admin/requesters/${row.id}`}
            className="bg-primary text-white px-1 py-1 rounded-lg hover:bg-primary/90 transition text-xs font-medium"
            title={t("requesters.edit") || "تعديل"}
          >
            <Edit width={15} />
          </Link>
          <button
            onClick={() => askToDelete(row.id)}
            className="bg-red-500 text-white px-1 py-1 rounded-lg hover:bg-red-600 transition text-xs font-medium"
            title={t("requesters.delete") || "حذف"}
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

export default RequestersTable;
