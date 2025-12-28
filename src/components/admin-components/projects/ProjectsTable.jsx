import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
} from "../../../redux/api/projectsApi";
import { useSelector } from "react-redux";
import AddReviewModal from "../../landing-components/add-rate/AddRateModal";
import { useTranslation } from "react-i18next";
import { EyeIcon, Edit, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

const ProjectsTable = ({ stats }) => {
  const { lang } = useContext(LanguageContext);
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const [searchParams] = useSearchParams();

  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const OrderStatusLookupId = searchParams.get("OrderStatusLookupId") || "";
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
        <span className="rounded-lg text-xs text-blue-600 font-normal">
          {row?.id ? row.id.substring(0, 8) : "-"}
        </span>
      ),
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
    role === "Requester"
      ? {}
      : {
          name: t("projects.provider"),
          selector: (row) => row?.provider?.name || "-",
          wrap: true,
        },
    {
      name: t("projects.startDate"),
      selector: (row) => row?.started_at ? dayjs(row.started_at).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("projects.endDate"),
      selector: (row) => row?.completed_at ? dayjs(row.completed_at).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("projects.orderStatus"),
      cell: (row) => (
        <span
          className={`px-0 py-1 rounded-lg text-[11px] font-normal
            ${
              row.status?.code === 'completed'
                ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                : row.status?.code === 'processing'
                ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                : row.status?.code === 'rejected' || row.status?.code === 'expired'
                ? "bg-red-100 text-red-700"
                : row.status?.code === 'waiting_start'
                ? "bg-red-100 text-[#B76E00]"
                : "bg-gray-100 text-gray-600"
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
            className="bg-[#1A71F6] text-white px-1 py-1 rounded-lg hover:bg-blue-700 transition text-xs font-medium"
            title={t("projects.view") || "عرض"}
          >
            <EyeIcon />
          </Link>
          {role === "Admin" && (
            <>
              <Link
                href={`/admin/projects/${row.id}`}
                className="bg-primary text-white px-1 py-1 rounded-lg hover:bg-primary/90 transition text-xs font-medium"
                title={t("projects.edit") || "تعديل"}
              >
                <Edit width={15} />
              </Link>
              <button
                onClick={() => askToDelete(row.id)}
                className="bg-red-500 text-white px-1 py-1 rounded-lg hover:bg-red-600 transition text-xs font-medium"
                title={t("projects.delete") || "حذف"}
              >
                <Trash width={15} />
              </button>
            </>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
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
