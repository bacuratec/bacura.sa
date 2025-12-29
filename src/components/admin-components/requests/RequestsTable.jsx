// example: pages/OrdersTable.jsx

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useGetOrdersQuery, useDeleteRequestMutation } from "../../../redux/api/ordersApi";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { EyeIcon, Edit, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

const RequestsTable = ({ stats }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const searchParams = useSearchParams();

  // استخراج القيم من الـ URL
  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const RequestStatus = searchParams.get("RequestStatus") || "";

  const totalRows = (() => {
    if (RequestStatus === "500")
      return stats?.underProcessingRequestsCount || 0;
    if (RequestStatus === "501")
      return stats?.initiallyApprovedRequestsCount || 0;
    if (RequestStatus === "502")
      return stats?.waitingForPaymentRequestsCount || 0;
    if (RequestStatus === "503") return stats?.rejectedRequestsCount || 0;
    if (RequestStatus === "504") return stats?.approvedRequestsCount || 0;
    if (RequestStatus === "505") return stats?.newRequestssCount || 0;
    return stats?.totalRequestsCount || 0;
  })();

  const {
    data: orders,
    isLoading,
    refetch,
  } = useGetOrdersQuery({
    PageNumber,
    PageSize,
    RequestStatus,
  });

  const [deleteRequest, { isLoading: isDeleting }] = useDeleteRequestMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, RequestStatus]);

  const askToDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteRequest(selectedId).unwrap();
      toast.success(t("requests.deleteSuccess") || "تم حذف الطلب بنجاح");
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || t("requests.deleteError") || "فشل حذف الطلب"
      );
    }
  };

  const tabs = [
    {
      name: t("request.all"),
      href: "",
      numbers: stats?.totalRequestsCount,
      color: "#637381",
    },
    {
      name: t("request.newRequest"),
      href: "?RequestStatus=505",
      numbers: stats?.newRequestssCount,
      color: "#B76E00",
    },
    {
      name: t("request.underProcessing"),
      href: "?RequestStatus=500",
      numbers: stats?.underProcessingRequestsCount,
      color: "#B76E00",
    },
    {
      name: t("request.initialApproval"),
      href: "?RequestStatus=501",
      numbers: stats?.initiallyApprovedRequestsCount,

      color: "#007867",
    },
    {
      name: t("request.awaitingPayment"),
      href: "?RequestStatus=502",
      numbers: stats?.waitingForPaymentRequestsCount,
      color: "#b76f21",
    },
    {
      name: t("request.rejected"),
      href: "?RequestStatus=503",
      numbers: stats?.rejectedRequestsCount,
      color: "#B71D18",
    },
    {
      name: t("request.completed"),
      href: "?RequestStatus=504",
      numbers: stats?.approvedRequestsCount,
      color: "#007867",
    },
  ];
  const columns = [
    {
      name: t("request.requestNumber"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row?.requestNumber || row?.id}
        </span>
      ),
    },
    {
      name: t("projects.serviceType"),
      selector: (row) => {
        const ar = row?.services?.[0]?.titleAr || row?.service?.name_ar;
        const en = row?.services?.[0]?.titleEn || row?.service?.name_en;
        return lang === "ar" ? (ar || "-") : (en || "-");
      },
      wrap: true,
    },
    {
      name: t("request.requesterName"),
      selector: (row) =>
        row?.fullName ||
        row?.requester?.full_name ||
        row?.requester?.name ||
        "-",
      wrap: true,
    },
    {
      name: t("request.requestDate"),
      selector: (row) =>
        dayjs(row?.creationTime || row?.created_at).format(
          "DD/MM/YYYY hh:mm A"
        ),
      wrap: true,
    },
    {
      name: t("request.requestStatus"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${
                (row.requestStatus?.id || row.status?.id) === 504
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                  : (row.requestStatus?.id || row.status?.id) === 501
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                  : (row.requestStatus?.id || row.status?.id) === 503
                  ? "bg-red-100 text-red-700"
                  : (row.requestStatus?.id || row.status?.id) === 502
                  ? "bg-red-100 text-[#B76E00]"
                  : "bg-gray-100 text-gray-600"
              }`}
        >
          {lang === "ar"
            ? row?.requestStatus?.nameAr || row?.status?.name_ar || "-"
            : row?.requestStatus?.nameEn || row?.status?.name_en || "-"}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("request.actions") || "الإجراءات",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/requests/${row.id}`}
            className="bg-[#1A71F6] text-white px-1 py-1 rounded-xl hover:bg-blue-700 transition text-xs font-medium text-nowrap"
            title={t("requests.view") || "عرض"}
          >
            <EyeIcon />
          </Link>
          <Link
            href={`/admin/requests/${row.id}`}
            className="bg-primary text-white px-1 py-1 rounded-lg hover:bg-primary/90 transition text-xs font-medium"
            title={t("requests.edit") || "تعديل"}
          >
            <Edit width={15} />
          </Link>
          <button
            onClick={() => askToDelete(row.id)}
            className="bg-red-500 text-white px-1 py-1 rounded-lg hover:bg-red-600 transition text-xs font-medium"
            title={t("requests.delete") || "حذف"}
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

  const sortedData = orders
    ? [...orders]?.sort((a, b) => {
        // لو رقم الطلب عبارة عن أرقام
        return Number(b?.requestNumber) - Number(a?.requestNumber); // تنازلي
        // return Number(a.requestNumber) - Number(b.requestNumber); // تصاعدي
      })
    : [];

  return (
    <>
      <div className="py-5">
        <div className="mx-2">
          <div className="rounded-3xl bg-white p-5">
            <CustomDataTable
              tabs={tabs}
              columns={columns}
              data={sortedData}
              searchableFields={["fullName", "email", "requestNumber", "title"]}
              searchPlaceholder={t("searchPlaceholder")}
              defaultPage={PageNumber}
              defaultPageSize={PageSize}
              isLoading={isLoading}
              totalRows={totalRows}
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

export default RequestsTable;
