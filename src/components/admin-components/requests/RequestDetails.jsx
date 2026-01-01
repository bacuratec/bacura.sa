import dayjs from "dayjs";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { formatCurrency } from "@/utils/currency";

const RequestDetails = ({ data }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const fullName =
    data?.fullName ||
    data?.requester?.full_name ||
    data?.requester?.name ||
    "-";
  const creationTime = data?.creationTime || data?.created_at;
  const description = data?.description || "";
  const requestNumber = data?.requestNumber || data?.id;
  const requestStatus = data?.requestStatus || data?.status || null;
  const pricingNotes = data?.admin_notes || data?.pricingNotes || data?.pricing_notes || "";
  const price = data?.admin_price ?? data?.provider_price ?? data?.servicePrice ?? data?.service?.price ?? data?.service?.base_price ?? data?.amount ?? null;
  const proposalUrl = data?.admin_proposal_file_url || null;
  const providerAssignedAt = data?.provider_assigned_at || null;
  const providerId = data?.provider_id || null;

  const joiningDateFormatted = dayjs(creationTime).format("DD/MM/YYYY hh:mm A");

  return (
    <section className="py-5">
      <div className="rounded-2xl bg-white shadow-sm p-6 flex flex-col lg:flex-row justify-between gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <DetailRow label={t("request.name")} value={fullName} />
          {description && (
            <DetailRow
              label={t("request.requestDescription")}
              value={description}
            />
          )}
          <DetailRow label={t("request.requestNumber")} value={requestNumber} />
          <DetailRow
            label={t("request.registrationDate")}
            value={joiningDateFormatted}
          />
          <DetailRow
            label={t("request.requestStatus")}
            value={
              lang === "ar"
                ? (requestStatus?.name_ar || requestStatus?.nameAr)
                : (requestStatus?.name_en || requestStatus?.nameEn)
            }
          />
          <DetailRow label={t("request.price")} value={formatCurrency(price, lang)} />
          {pricingNotes && (
            <DetailRow label={t("request.notes")} value={pricingNotes} />
          )}
          {proposalUrl && (
            <DetailRow
              label={t("request.proposalFile") || "ملف العرض"}
              value={<a href={proposalUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">تحميل</a>}
            />
          )}
          {providerId && (
            <DetailRow
              label={t("request.provider") || "مزوّد الخدمة"}
              value={String(providerId)}
            />
          )}
          {providerAssignedAt && (
            <DetailRow
              label={t("request.providerAssignedAt") || "تاريخ تعيين المزود"}
              value={dayjs(providerAssignedAt).format("DD/MM/YYYY hh:mm A")}
            />
          )}
        </div>
      </div>
    </section>
  );
};

// مكون فرعي لعرض كل صف
const DetailRow = ({ label, value }) => (
  <div className="flex items-center gap-2 md:gap-4">
    <span className="text-primary font-bold whitespace-nowrap">{label}:</span>
    <span className="text-sm text-gray-700">{value || "-"}</span>
  </div>
);

export default RequestDetails;
