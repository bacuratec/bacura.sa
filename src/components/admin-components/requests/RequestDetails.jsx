import dayjs from "dayjs";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { formatCurrency } from "@/utils/currency";
import {
  User,
  FileText,
  Calendar,
  Hash,
  Tag,
  DollarSign,
  FileCheck,
  UserCheck,
  Clock,
  Info
} from "lucide-react";

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
  const providerName = data?.provider?.name || (data?.provider_id ? String(data.provider_id).slice(0, 8) + "..." : null);

  const joiningDateFormatted = dayjs(creationTime).format("DD/MM/YYYY hh:mm A");

  return (
    <section className="py-6 animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("requestDetails.title") || "تفاصيل الطلب"}</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Hash className="w-3 h-3" />
              {requestNumber}
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">

            <DetailItem
              icon={<User className="w-5 h-5 text-blue-500" />}
              label={t("request.name")}
              value={fullName}
            />

            <DetailItem
              icon={<Calendar className="w-5 h-5 text-purple-500" />}
              label={t("request.registrationDate")}
              value={<span suppressHydrationWarning>{joiningDateFormatted}</span>}
            />

            <DetailItem
              icon={<Tag className="w-5 h-5 text-amber-500" />}
              label={t("request.requestStatus")}
              value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                  {lang === "ar"
                    ? (requestStatus?.name_ar || requestStatus?.nameAr)
                    : (requestStatus?.name_en || requestStatus?.nameEn)
                  }
                </span>
              }
            />

            <DetailItem
              icon={<DollarSign className="w-5 h-5 text-green-500" />}
              label={t("request.price")}
              value={
                price ? (
                  <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                    {formatCurrency(price, lang)}
                  </span>
                ) : "-"
              }
            />

            {providerName && (
              <DetailItem
                icon={<UserCheck className="w-5 h-5 text-indigo-500" />}
                label={t("request.provider") || "مزوّد الخدمة"}
                value={providerName}
              />
            )}

            {providerAssignedAt && (
              <DetailItem
                icon={<Clock className="w-5 h-5 text-indigo-400" />}
                label={t("request.providerAssignedAt") || "تاريخ التعيين"}
                value={<span suppressHydrationWarning>{dayjs(providerAssignedAt).format("DD/MM/YYYY hh:mm A")}</span>}
              />
            )}

            {proposalUrl && (
              <DetailItem
                icon={<FileCheck className="w-5 h-5 text-teal-500" />}
                label={t("request.proposalFile") || "ملف العرض"}
                value={
                  <a
                    href={proposalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium transition-colors hover:underline"
                  >
                    {t("common.download") || "تحميل"}
                  </a>
                }
              />
            )}

            {/* Full Width Items */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              {description && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                    <Info className="w-5 h-5 text-gray-400" />
                    {t("request.requestDescription")}
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              )}
            </div>

            {pricingNotes && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3 text-amber-800 font-semibold">
                    <FileText className="w-5 h-5 text-amber-500" />
                    {t("request.notes")}
                  </div>
                  <p className="text-amber-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {pricingNotes}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

// Reusable Detail Item Component
const DetailItem = ({ icon, label, value }) => (
  <div className="flex flex-col gap-2 group">
    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium group-hover:text-primary transition-colors">
      <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-primary/5 transition-colors">
        {icon}
      </div>
      {label}
    </div>
    <div className="text-gray-900 font-semibold text-base pl-9">
      {value || <span className="text-gray-300 italic">-</span>}
    </div>
  </div>
);

export default RequestDetails;
