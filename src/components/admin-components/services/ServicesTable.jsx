import { useContext, useEffect, useState } from "react";
import CustomDataTable from "../../shared/datatable/DataTable";
import {
  useActiveServiceStatusMutation,
  useDeActiveServiceStatusMutation,
  useGetServicesQuery,
  useUpdateServicePriceMutation,
} from "../../../redux/api/servicesApi";
import UpdatePriceModal from "./UpdatePriceModal";
import { useTranslation } from "react-i18next";
import { Edit } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";

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
  const [localData, setLocalData] = useState([]);

  // Sync localData with API data once
  useEffect(() => {
    setLocalData(services);
  }, [services]);

  const handleEdit = (service) => {
    setService(service);
    setOpenPriceModal(true);
  };

  const handleToggleStatus = async (service) => {
    const updatedServices = localData?.map((s) =>
      s.id === service.id ? { ...s, isActive: !s.isActive } : s
    );
    setLocalData(updatedServices); // Update UI immediately (optimistic)

    try {
      if (service.isActive) {
        await deActiveServiceStatus({ id: service.id }).unwrap();
      } else {
        await ActiveServiceStatus({ id: service.id }).unwrap();
      }
    } catch (err) {
      console.error("فشل تغيير الحالة:", err);

      // Rollback if API fails
      const rollbackServices = localData?.map((s) =>
        s.id === service.id ? { ...s, isActive: service.isActive } : s
      );
      setLocalData(rollbackServices);
    }
  };

  const columns = [
    {
      name: t("services.serviceTitle"),
      selector: (row) => (lang === "ar" ? row?.titleAr : row?.titleEn) || "-",
      wrap: true,
    },
    {
      name: t("services.price"),
      selector: (row) => (row?.price ? `${row.price} ر.س` : "-"),
      wrap: true,
    },
    {
      name: t("services.status"),
      cell: (row) => (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!row?.isActive}
            onChange={() => handleToggleStatus(row)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 relative transition-colors">
            <div
              className={`absolute top-1 ${
                row?.isActive ? "left-1" : "right-1"
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
      name: t("services.actions"),
      cell: (row) => (
        <div className="flex gap-2">
          {row?.isPriced && (
            <button
              onClick={() => handleEdit(row)}
              className="bg-yellow-500 text-white px-1 py-1 rounded-md text-xs hover:bg-yellow-600 transition"
            >
              <Edit />
            </button>
          )}
        </div>
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
          <UpdatePriceModal
            open={openPriceModal}
            setOpen={setOpenPriceModal}
            onSubmit={handleUpdatePrice}
            refetch={refetch}
          />
          <CustomDataTable
            columns={columns}
            data={localData}
            searchableFields={["titleAr", "price", "titleEn"]}
            searchPlaceholder={t("searchPlaceholder")}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ServicesTable;
