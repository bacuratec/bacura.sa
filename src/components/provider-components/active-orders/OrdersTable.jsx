import Link from "next/link";
import { useSearchParams } from "@/utils/useSearchParams";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import { useGetProjectsProvidersQuery, useProviderProjectStateMutation } from "../../../redux/api/projectsApi";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Eye, Check, X } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import { useGetProviderByUserIdQuery } from "../../../redux/api/usersDetails";
import { useState } from "react";

const OrdersTable = () => {
  const { lang } = useContext(LanguageContext);

  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.userId);

  // Get provider ID from user
  const { data: providerData } = useGetProviderByUserIdQuery(userId, { skip: !userId });
  const providerId = Array.isArray(providerData) ? providerData[0]?.id : providerData?.id;

  const searchParams = useSearchParams();
  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const OrderStatusLookupId = searchParams.get("OrderStatusLookupId") || "";

  const [updateOrderStatus, { isLoading: isUpdating }] = useProviderProjectStateMutation();
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const handleAcceptOrder = async (orderId) => {
    try {
      setProcessingOrderId(orderId);
      // Status 18 = waiting_start (accepted)
      await updateOrderStatus({ orderId, statusId: 18 }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to accept order:', error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      setProcessingOrderId(orderId);
      // Status 16 = rejected
      await updateOrderStatus({ orderId, statusId: 16 }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to reject order:', error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const {
    data: projects,
    isLoading,
    refetch,
  } = useGetProjectsProvidersQuery({
    PageNumber,
    PageSize,
    OrderStatusLookupId: OrderStatusLookupId || undefined, // Use URL param or show all
    providerId,
  }, { skip: !providerId });

  useEffect(() => {
    if (providerId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, OrderStatusLookupId, providerId]);

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
      selector: (row) => row?.requester?.fullName || row?.request?.requester?.name || t("unknown") || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.provider") || "مزود الخدمة",
      selector: (row) => row?.providers?.fullName || row?.provider?.name || t("unknown") || "-",
      wrap: true,
    },
    {
      name: t("projects.serviceType") || "نوع الخدمة",
      selector: (row) =>
        lang === "ar"
          ? row?.services?.[0]?.titleAr || row?.request?.service?.name_ar || "-"
          : row?.services?.[0]?.titleEn || row?.request?.service?.name_en || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.startDate") || "تاريخ البداية",
      selector: (row) =>
        row?.startDate
          ? dayjs(row.startDate).format("DD/MM/YYYY hh:mm A")
          : (row?.created_at ? dayjs(row.created_at).format("DD/MM/YYYY hh:mm A") : "-"),
      wrap: true,
    },
    {
      name: t("orders.columns.endDate") || "تاريخ النهاية",
      selector: (row) =>
        row?.endDate ? dayjs(row.endDate).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },

    {
      name: t("orders.columns.status") || "الحالة",
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
            ${(row?.orderStatus?.id === 603 || row?.status?.code === 'completed')
              ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
              : (row?.orderStatus?.id === 602 || row?.status?.code === 'accepted')
                ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                : (row?.orderStatus?.id === 605 || row?.orderStatus?.id === 604 || row?.status?.code === 'rejected')
                  ? "bg-red-100 text-red-700"
                  : (row?.orderStatus?.id === 601 || row?.status?.code === 'waiting-approval')
                    ? "bg-red-100 text-[#B76E00]"
                    : "bg-gray-100 text-gray-600"
            }`}
        >
          {lang === "ar"
            ? (row?.orderStatus?.nameAr || row?.status?.name_ar || "-")
            : (row?.orderStatus?.nameEn || row?.status?.name_en || "-")}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("orders.columns.action") || "الإجراءات",
      cell: (row) => {
        // Show accept/reject buttons for orders that are not completed (15) or rejected (16)
        const canAcceptReject = row?.order_status_id !== 15 && row?.order_status_id !== 16;
        const isProcessing = processingOrderId === row.id;

        return (
          <div className="flex items-center gap-2">
            {/* Accept/Reject buttons for pending orders */}
            {canAcceptReject && (
              <>
                <button
                  onClick={() => handleAcceptOrder(row.id)}
                  disabled={isProcessing}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t("orders.accept") || "قبول"}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRejectOrder(row.id)}
                  disabled={isProcessing}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t("orders.reject") || "رفض"}
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}

            {/* View button */}
            <Link
              href={
                role === "Admin"
                  ? `/admin/projects/${row.id}`
                  : role === "Requester"
                    ? `/projects/${row.id}`
                    : `/provider/projects/${row.id}`
              }
              className="bg-[#1A71F6] text-white p-2 rounded-lg hover:bg-blue-700 transition"
              title={t("orders.view") || "عرض"}
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        );
      },
      ignoreRowClick: true,
      button: true,
      width: "200px",
    },
  ];

  const baseData = Array.isArray(projects) ? projects : (projects?.data || []);

  // Filter by URL param if provided, otherwise show all
  const filteredProjects = OrderStatusLookupId === ""
    ? baseData
    : baseData?.filter((item) =>
      (item.orderStatus?.id === Number(OrderStatusLookupId)) ||
      (item.status?.id === Number(OrderStatusLookupId)) ||
      (item.order_status_id === Number(OrderStatusLookupId))
    );

  const sortedData = filteredProjects
    ? [...filteredProjects]?.sort((a, b) => {
      return Number(b?.orderNumber || b?.id) - Number(a?.orderNumber || a?.id);
    })
    : [];

  return (
    <div className="py-8 bg-gray-50/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="glass-card p-2 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div className="bg-white rounded-[2.2rem] overflow-hidden p-6">
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
    </div>
  );
};

export default OrdersTable;
