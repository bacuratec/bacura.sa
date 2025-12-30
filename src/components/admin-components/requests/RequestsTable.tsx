import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import { requestService } from "@/services/api";
import { useContext, useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { EyeIcon, Edit, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

const RequestsTable = ({ stats }: { stats: any }) => {
    const { t } = useTranslation();
    const { lang } = useContext(LanguageContext);

    const searchParams = useSearchParams();

    // Extract values from URL
    const PageNumber = searchParams.get("PageNumber") || 1;
    const PageSize = searchParams.get("PageSize") || 30;
    const RequestStatus = searchParams.get("RequestStatus") || "";

    const totalRows = (() => {
        if (RequestStatus === "8") // Priced (Under Processing)
            return stats?.underProcessingRequestsCount || 0;
        if (RequestStatus === "9") // Accepted (Initial Approval)
            return stats?.initiallyApprovedRequestsCount || 0;
        if (RequestStatus === "21") // Waiting Payment
            return stats?.waitingForPaymentRequestsCount || 0;
        if (RequestStatus === "10") return stats?.rejectedRequestsCount || 0; // Rejected
        if (RequestStatus === "11") return stats?.approvedRequestsCount || 0; // Completed
        if (RequestStatus === "7") return stats?.newRequestsCount || 0; // Pending (New)
        return stats?.totalRequestsCount || 0;
    })();

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await requestService.getAllRequests({
                pageNumber: Number(PageNumber),
                pageSize: Number(PageSize),
                requestStatus: RequestStatus
            });
            if (data) {
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
            toast.error("Failed to fetch requests");
        } finally {
            setIsLoading(false);
        }
    }, [PageNumber, PageSize, RequestStatus]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const [isDeleting, setIsDeleting] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const askToDelete = (id: string) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    const onDelete = async () => {
        if (!selectedId) return;
        setIsDeleting(true);
        try {
            const { error } = await requestService.delete(selectedId);
            if (error) throw new Error(error);

            toast.success(t("requests.deleteSuccess") || "تم حذف الطلب بنجاح");
            setOpenDelete(false);
            setSelectedId(null);
            fetchOrders();
        } catch (err: any) {
            toast.error(
                err?.message || t("requests.deleteError") || "فشل حذف الطلب"
            );
        } finally {
            setIsDeleting(false);
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
            href: "?RequestStatus=7",
            numbers: stats?.newRequestsCount,
            color: "#B76E00",
        },
        {
            name: t("request.underProcessing"),
            href: "?RequestStatus=8",
            numbers: stats?.underProcessingRequestsCount,
            color: "#B76E00",
        },
        {
            name: t("request.initialApproval"),
            href: "?RequestStatus=9",
            numbers: stats?.initiallyApprovedRequestsCount,
            color: "#007867",
        },
        {
            name: t("request.awaitingPayment"),
            href: "?RequestStatus=21",
            numbers: stats?.waitingForPaymentRequestsCount,
            color: "#b76f21",
        },
        {
            name: t("request.rejected"),
            href: "?RequestStatus=10",
            numbers: stats?.rejectedRequestsCount,
            color: "#B71D18",
        },
        {
            name: t("request.completed"),
            href: "?RequestStatus=11",
            numbers: stats?.approvedRequestsCount,
            color: "#007867",
        },
    ];

    const columns = [
        {
            name: t("request.requestNumber"),
            cell: (row: any) => (
                <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
                    {row?.requestNumber || row?.id}
                </span>
            ),
        },
        {
            name: t("projects.serviceType"),
            selector: (row: any) => {
                const ar = row?.services?.[0]?.titleAr || row?.service?.name_ar;
                const en = row?.services?.[0]?.titleEn || row?.service?.name_en;
                return lang === "ar" ? (ar || "-") : (en || "-");
            },
            wrap: true,
        },
        {
            name: t("request.requesterName"),
            selector: (row: any) =>
                row?.fullName ||
                row?.requester?.full_name ||
                row?.requester?.name ||
                "-",
            wrap: true,
        },
        {
            name: t("request.requestDate"),
            selector: (row: any) =>
                dayjs(row?.creationTime || row?.created_at).format(
                    "DD/MM/YYYY hh:mm A"
                ),
            wrap: true,
        },
        {
            name: t("request.requestStatus"),
            cell: (row: any) => (
                <span
                    className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${(row.requestStatus?.id || row.status?.id) === 11
                            ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                            : (row.requestStatus?.id || row.status?.id) === 9
                                ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                                : (row.requestStatus?.id || row.status?.id) === 10
                                    ? "bg-red-100 text-red-700"
                                    : (row.requestStatus?.id || row.status?.id) === 21
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
            cell: (row: any) => (
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
                            tabs={tabs as any}
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
