import { useContext, useEffect, useState } from "react";
import CustomDataTable from "../../shared/datatable/DataTable";
import {
  useActiveServiceStatusMutation,
  useDeActiveServiceStatusMutation,
  useGetServicesQuery,
  useUpdateServicePriceMutation,
  useDeleteServiceMutation,
} from "../../../redux/api/servicesApi";
import UpdatePriceModal from "./UpdatePriceModal";
import { useTranslation } from "react-i18next";
import { Edit, PlusIcon, Trash } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import Link from "next/link";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

import { formatCurrency } from "@/utils/currency";

const ServicesTable = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const { data: services = [], isLoading, refetch } = useGetServicesQuery();

  const [service, setService] = useState("");
  const [openPriceModal, setOpenPriceModal] = useState(false);

  const [updateServicePrice] = useUpdateServicePriceMutation();
  const handleUpdatePrice = async (newPrice) => {
    // هنا تحط استدعاء API بتاعك
    await updateServicePrice({ id: service.id, body: { price: newPrice } });
  };

  const [ActiveServiceStatus] = useActiveServiceStatusMutation();
  const [deActiveServiceStatus] = useDeActiveServiceStatusMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();
  const [localData, setLocalData] = useState([]);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Sync localData with API data once
  useEffect(() => {
    setLocalData(services);
  }, [services]);

  const handleEdit = (service) => {
    setService(service);
    setOpenPriceModal(true);
  };

  const askToDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteService(selectedId).unwrap();
      toast.success(t("services.deleteSuccess") || "تم حذف الخدمة بنجاح");
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || t("services.deleteError") || "فشل حذف الخدمة"
      );
    }
  };

  const handleToggleStatus = async (service) => {
    const updatedServices = localData?.map((s) =>
      s.id === service.id ? { ...s, is_active: !s.is_active } : s
    );
    setLocalData(updatedServices); // Update UI immediately (optimistic)

    try {
      if (service.is_active) {
        await deActiveServiceStatus({ id: service.id }).unwrap();
      } else {
        await ActiveServiceStatus({ id: service.id }).unwrap();
      }
    } catch (err) {
      toast.error(
        err?.data?.message || t("services.statusChangeError") || "فشل تغيير الحالة"
      );

      // Rollback if API fails
      const rollbackServices = localData?.map((s) =>
        s.id === service.id ? { ...s, is_active: service.is_active } : s
      );
      setLocalData(rollbackServices);
    }
  };

  const columns = [
    {
      name: t("services.image") || "الصورة",
      cell: (row) => (
        <div className="w-12 h-12 rounded overflow-hidden border bg-gray-50">
          {row?.image_url || row?.imageUrl ? (
            <img
              src={row.image_url || row.imageUrl}
              alt="service"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              -
            </div>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "80px",
    },
    {
      name: t("services.serviceTitle"),
      selector: (row) => (lang === "ar" ? row?.name_ar : row?.name_en) || "-",
      wrap: true,
    },
    {
      name: t("services.price"),
      selector: (row) => formatCurrency(row?.price, lang),
      wrap: true,
      sortable: true,
    },
    {
      name: t("services.status"),
      cell: (row) => (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!row?.is_active}
            onChange={() => handleToggleStatus(row)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 relative transition-colors">
            <div
              className={`absolute top-1 ${
                row?.is_active ? "left-1" : "right-1"
              } w-4 h-4 bg-white rounded-full transition-all peer-checked:left-6`}
            />
          </div>
        </label>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: t("services.actions") || "الإجراءات",
      cell: (row) => (
        <div className="flex gap-2">
          <Link
            href={`/admin/services/${row.id}/edit`}
            className="btn btn-blue px-2 py-1 text-xs"
            title={t("services.editService") || "تعديل الخدمة"}
          >
            <Edit />
          </Link>
          {row?.price && (
            <button
              onClick={() => handleEdit(row)}
              className="btn btn-yellow px-2 py-1 text-xs"
              title={t("services.editPrice") || "تعديل السعر"}
            >
              <Edit />
            </button>
          )}
          <button
            onClick={() => askToDelete(row.id)}
            className="btn btn-danger px-2 py-1 text-xs font-medium"
            title={t("services.delete") || "حذف"}
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
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700">
                {t("services.title") || "الخدمات"}
              </h2>
              <Link
                href="/admin/add-service"
                className="btn btn-primary text-sm md:text-base"
              >
                <PlusIcon className="w-4 h-4" />{" "}
                {t("services.addService") || "إضافة خدمة"}
              </Link>
            </div>
            <UpdatePriceModal
              open={openPriceModal}
              setOpen={setOpenPriceModal}
              onSubmit={handleUpdatePrice}
              refetch={refetch}
            />
            <CustomDataTable
              columns={columns}
              data={localData}
              searchableFields={["name_ar", "price", "name_en"]}
              searchPlaceholder={t("searchPlaceholder")}
              isLoading={isLoading}
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

export default ServicesTable;
