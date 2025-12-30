import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import Avatar from "../../shared/Avatar";
import { useContext, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Edit, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";
import { providerService, profileService } from "@/services/api";
import TableActions from "../../shared/TableActions";

interface ProvidersTableProps {
    stats: any;
}

const ProvidersTable = ({ stats }: ProvidersTableProps) => {
    const { t } = useTranslation();
    const { lang } = useContext(LanguageContext);

    const searchParams = useSearchParams();

    // Extract values from URL
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

    const [providers, setProviders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProviders = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await providerService.getAllProviders({
                pageNumber: Number(PageNumber),
                pageSize: Number(PageSize),
                accountStatus: AccountStatus,
            });
            if (data) {
                setProviders(data);
            }
        } catch (error) {
            console.error("Failed to fetch providers", error);
            toast.error("Failed to fetch providers");
        } finally {
            setIsLoading(false);
        }
    }, [PageNumber, PageSize, AccountStatus]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

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
            const { error } = await providerService.delete(selectedId);
            if (error) throw new Error(error);

            toast.success(t("providers.deleteSuccess") || "تم حذف مزود الخدمة بنجاح");
            setOpenDelete(false);
            setSelectedId(null);
            fetchProviders();
        } catch (err: any) {
            toast.error(
                err?.message || t("providers.deleteError") || "فشل حذف مزود الخدمة"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const onApprove = async (id: string) => {
        // Assuming approving means setting status to active (201 or similar logic) not strictly defined yet without authApi context
        // Re-using toggleBlock/Suspend or we might need a specific 'approve' in profileService in future.
        // For now, let's assume acceptance = unblocking or specific status update if needed.
        // Checking adminProfilesApi for redundant implementation details... 
        // It seems it updates 'profile_status_id'. Let's add that to ProviderService or strictly use update.
        // Direct update for now:
        try {
            const { error } = await providerService.update(id, { profile_status_id: 201 }); // 201 = Active
            if (error) throw new Error(error);
            toast.success(t("providers.approveSuccess") || "تم قبول الحساب بنجاح");
            fetchProviders();
        } catch (err: any) {
            toast.error(err?.message || t("providers.approveError") || "فشل قبول الحساب");
        }
    };

    const onReject = async (id: string) => {
        try {
            const { error } = await providerService.update(id, { profile_status_id: 202 }); // 202 = Blocked
            if (error) throw new Error(error);
            toast.success(t("providers.rejectSuccess") || "تم رفض/حظر الحساب");
            fetchProviders();
        } catch (err: any) {
            toast.error(err?.message || t("providers.rejectError") || "فشل رفض الحساب");
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
            name: t("providersTable.columns.avatar") || "",
            width: "60px",
            cell: (row: any) => (
                <Avatar
                    src={row?.logoUrl || null}
                    name={row?.name || row?.email || ""}
                    size={36}
                    className="bg-white"
                />
            ),
        },
        {
            name: t("providersTable.columns.name"),
            cell: (row: any) => (
                <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
                    {row.name}
                </span>
            ),
        },
        {
            name: t("providersTable.columns.entityType"),
            selector: (row: any) =>
                lang === "ar"
                    ? row.entityType?.nameAr || row.entity_type?.name_ar
                    : row.entityType?.nameEn || row.entity_type?.name_en,
            wrap: true,
        },
        {
            name: t("providersTable.columns.email"),
            cell: (row: any) => (
                <a href={`mailto:${row?.email || ""}`} className="text-blue-600 hover:underline">
                    {row?.email || ""}
                </a>
            ),
            sortable: true,
            wrap: true,
        },
        {
            name: t("providersTable.columns.phone"),
            cell: (row: any) => (
                <a href={`tel:${row?.phoneNumber || ""}`} className="text-gray-700 hover:text-black">
                    {row?.phoneNumber || ""}
                </a>
            ),
            wrap: true,
        },
        {
            name: t("providersTable.columns.region"),
            selector: (row: any) =>
                lang === "ar"
                    ? row.city?.nameAr || row.city?.name_ar
                    : row.city?.nameEn || row.city?.name_en,
            wrap: true,
        },
        {
            name: t("providersTable.columns.status"),
            cell: (row: any) => (
                <span
                    className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
          ${row.profileStatus?.id === 201
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
            cell: (row: any) => (
                <TableActions
                    actions={[
                        {
                            label: t("providers.view") || "عرض",
                            icon: <Eye className="w-4 h-4" />,
                            href: `/admin/providers/${row.id}`,
                        },
                        {
                            label: t("providers.approve") || "قبول",
                            icon: <div className="w-2 h-2 rounded-full bg-green-500 mx-1" />,
                            onClick: () => onApprove(row.id),
                            variant: "success",
                        },
                        {
                            label: t("providers.reject") || "رفض",
                            icon: <div className="w-2 h-2 rounded-full bg-orange-500 mx-1" />,
                            onClick: () => onReject(row.id),
                            variant: "destructive",
                        },
                        {
                            label: t("providers.edit") || "تعديل",
                            icon: <Edit className="w-4 h-4" />,
                            href: `/admin/providers/${row.id}`,
                        },
                        {
                            label: t("providers.delete") || "حذف",
                            icon: <Trash className="w-4 h-4" />,
                            onClick: () => askToDelete(row.id),
                            variant: "destructive",
                        },
                    ]}
                />
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
                            tabs={tabs as any}
                            columns={columns}
                            data={providers}
                            searchableFields={["name", "email", "phoneNumber"] as any}
                            searchPlaceholder={t("searchPlaceholder")}
                            defaultPage={Number(PageNumber)}
                            defaultPageSize={Number(PageSize)}
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

export default ProvidersTable;
