import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  useGetProjectsQuery,
  useGetProjectsRequestersQuery,
  useDeleteProjectMutation,
} from "../../../redux/api/projectsApi";
import { useSelector } from "react-redux";
import AddReviewModal from "../../landing-components/add-rate/AddRateModal";
import { useTranslation } from "react-i18next";
import { EyeIcon, Edit, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

const ProjectsTable = ({ stats, requesterId }) => {
  const { lang } = useContext(LanguageContext);
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const searchParams = useSearchParams();

  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const OrderStatusLookupId = searchParams.get("OrderStatusLookupId") || "";

  // Map string codes to IDs for API query
  const getStatusId = (code) => {
    switch (code) {
      case "waiting_approval": return 17;
      case "waiting_start": return 18;
      case "processing": return 13;
      case "completed": return 15;
      case "ended": return 15;
      case "rejected": return 19;
      case "expired": return 20;
      case "cancelled": return 16;
      case "on-hold": return 14;
      default: return "";
    }
  };

  const totalRows = (() => {
    // These mappings should ideally come from an API or shared constant
    if (OrderStatusLookupId === "waiting_approval")
      return stats?.waitingForApprovalOrdersCount || 0;
    if (OrderStatusLookupId === "waiting_start")
      return stats?.waitingToStartOrdersCount || 0;
    if (OrderStatusLookupId === "processing") return stats?.ongoingOrdersCount || 0;
    if (OrderStatusLookupId === "completed") return stats?.completedOrdersCount || 0;
    if (OrderStatusLookupId === "rejected") return stats?.rejectedOrdersCount || 0;
    if (OrderStatusLookupId === "ended")
      return stats?.serviceCompletedOrdersCount || 0; // Assuming ended = service completed
    if (OrderStatusLookupId === "expired")
      return stats?.expiredOrdersCount || 0;
    return stats?.totalOrdersCount || 0;
  })();
  // Choose the appropriate query hook based on role
  const useProjectsQuery = role === "Requester" ? useGetProjectsRequestersQuery : useGetProjectsQuery;
  const queryParams = {
    PageNumber,
    PageSize,
    OrderStatusLookupId: getStatusId(OrderStatusLookupId),
  };

  // If Requester, add requesterId to params
  if (role === "Requester" && requesterId) {
    queryParams.requesterId = requesterId;
  }

  const {
    data: projects,
    isLoading,
    refetch,
  } = useProjectsQuery(queryParams);

  const [deleteProject, { isLoading: isDeleting }] =
    useDeleteProjectMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, OrderStatusLookupId]);

  const askToDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteProject(selectedId).unwrap();
      toast.success(t("projects.deleteSuccess") || "تم حذف المشروع بنجاح");
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || t("projects.deleteError") || "فشل حذف المشروع"
      );
    }
  };

  const tabs = [
    {
      name: t("projects.all"),
      href: "",
      numbers: stats?.totalOrdersCount,
      color: "#637381",
    },
    {
      name: t("projects.waitingApproval"),
      href: "?OrderStatusLookupId=waiting_approval",
      numbers: stats?.waitingForApprovalOrdersCount,
      color: "#B76E00",
    },
    {
      name: t("projects.waitingStart"),
      href: "?OrderStatusLookupId=waiting_start",
      numbers: stats?.waitingToStartOrdersCount,
      color: "#B76E00",
    },
    {
      name: t("projects.processing"),
      href: "?OrderStatusLookupId=processing",
      numbers: stats?.ongoingOrdersCount,
      color: "#b76f21",
    },

    {
      name: t("projects.completed"),
      href: "?OrderStatusLookupId=completed",
      numbers: stats?.serviceCompletedOrdersCount,
      color: "#007867",
    },
    {
      name: t("projects.ended"),
      href: "?OrderStatusLookupId=ended",
      numbers: stats?.completedOrdersCount,
      color: "#007867",
    },
    {
      name: t("projects.rejected"),
      href: "?OrderStatusLookupId=rejected",
      numbers: stats?.rejectedOrdersCount,
      color: "#B71D18",
    },
    {
      name: t("projects.expired"),
      href: "?OrderStatusLookupId=expired",
      numbers: stats?.expiredOrdersCount,
      color: "#B71D18",
    },
  ];

  const columns = [
    {
      name: t("projects.orderNumber"),
      cell: (row) => (
        <span className="text-xs font-medium text-gray-400">
          #{row?.id ? row.id.substring(0, 8) : "-"}
        </span>
      ),
      width: "100px",
    },
    {
      name: t("projects.requester"),
      selector: (row) => row?.request?.requester?.name || "-",
      wrap: true,
    },
    {
      name: t("projects.serviceType"),
      selector: (row) =>
        lang === "ar" ? row?.request?.service?.name_ar : row?.request?.service?.name_en,
      wrap: true,
    },
    ...(role !== "Requester"
      ? [
        {
          name: t("projects.provider"),
          selector: (row) => row?.provider?.name || "-",
          wrap: true,
        },
      ]
      : []),
    {
      name: t("projects.startDate"),
      selector: (row) => row?.started_at ? dayjs(row.started_at).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("projects.orderStatus"),
      cell: (row) => (
        <span
          className={`text-nowrap px-3 py-1 rounded-full text-[10px] font-bold border
            ${row.status?.code === 'completed' || row.status?.code === 'ended'
              ? "border-green-200 bg-green-50 text-green-700"
              : row.status?.code === 'processing' || row.status?.code === 'waiting_start'
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : row.status?.code === 'rejected' || row.status?.code === 'expired' || row.status?.code === 'cancelled'
                  ? "border-red-200 bg-red-50 text-red-700"
                  : row.status?.code === 'waiting_approval' || row.status?.code === 'on-hold'
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
            }`}
        >
          {lang === "ar" ? row?.status?.name_ar : row?.status?.name_en}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("projects.action") || "الإجراءات",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={
              role === "Admin"
                ? `/admin/projects/${row.id}`
                : role === "Requester"
                  ? `/projects/${row.id}`
                  : `/provider/projects/${row.id}`
            }
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            title={t("projects.view") || "عرض"}
          >
            <EyeIcon size={16} />
          </Link>
          {role === "Admin" && (
            <>
              <Link
                href={`/admin/projects/${row.id}`}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                title={t("projects.edit") || "تعديل"}
              >
                <Edit size={14} />
              </Link>
              <button
                onClick={() => askToDelete(row.id)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                title={t("projects.delete") || "حذف"}
              >
                <Trash size={14} />
              </button>
            </>
          )}
        </div>
      ),
      width: "120px",
    },
  ];

  const sortedData = projects
    ? [...projects]?.sort(
      (a, b) => new Date(b?.created_at) - new Date(a?.created_at)
    )
    : [];

  return (
    <>
      <div className="py-5">
        <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="font-bold text-2xl text-gray-800">
              {(role === "Requester" ? t("navProvider.myProjects") : t("projects.title")) || t("projects.all")}
            </h3>
          </div>

          <div className="overflow-hidden">
            <CustomDataTable
              tabs={tabs}
              columns={columns}
              data={sortedData}
              searchableFields={["id", "started_at"]}
              searchPlaceholder={t("searchPlaceholder")}
              isLoading={isLoading}
              totalRows={totalRows}
            />
          </div>
        </div>
      </div>

      {role === "Admin" && (
        <ModalDelete
          open={openDelete}
          onClose={() => {
            setOpenDelete(false);
            setSelectedId(null);
          }}
          onConfirm={onDelete}
          loading={isDeleting}
        />
      )}
    </>
  );
};

export default ProjectsTable;
