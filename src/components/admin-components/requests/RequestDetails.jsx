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
    <section className="py-8 animate-fade-in-up">
      <div className="bg-white rounded-[2rem] shadow-custom border border-gray-100 overflow-hidden relative">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-primary" />

        {/* Header Section */}
        <div className="bg-gradient-to-b from-primary/5 to-white px-8 py-8 border-b border-gray-100/50 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <FileText className="w-8 h-8 drop-shadow-sm" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t("requestDetails.title") || "تفاصيل الطلب"}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${requestStatus?.code === 'priced' || requestStatus?.code === 'paid'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-primary/10 text-primary border-primary/20'
                }`}>
                {lang === "ar"
                  ? (requestStatus?.name_ar || requestStatus?.nameAr)
                  : (requestStatus?.name_en || requestStatus?.nameEn)
                }
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
              <Hash className="w-3.5 h-3.5 text-secondary" />
              {requestNumber}
            </p>
          </div>

          {price && (
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-end">
              <span className="text-xs text-gray-400 font-medium mb-0.5">{t("request.price") || "قيمة الطلب"}</span>
              <span className="text-xl font-bold text-primary font-mono">
                {formatCurrency(price, lang)}
              </span>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">

            <DetailItem
              icon={<User className="w-5 h-5 text-primary" />}
              label={t("request.name")}
              value={fullName}
            />

            <DetailItem
              icon={<Calendar className="w-5 h-5 text-secondary" />}
              label={t("request.registrationDate")}
              value={<span suppressHydrationWarning>{joiningDateFormatted}</span>}
              subValue={<span className="text-[10px] text-gray-400">Created At</span>}
            />

            {/* Status removed from grid as it is now in header */}

            {/* Price removed from grid as it is now in header */}

            {providerName && (
              <DetailItem
                icon={<UserCheck className="w-5 h-5 text-green-600" />}
                label={t("request.provider") || "مزوّد الخدمة"}
                value={providerName}
                highlight
              />
            )}

            {providerAssignedAt && (
              <DetailItem
                icon={<Clock className="w-5 h-5 text-primary/70" />}
                label={t("request.providerAssignedAt") || "تاريخ التعيين"}
                value={<span suppressHydrationWarning>{dayjs(providerAssignedAt).format("DD/MM/YYYY hh:mm A")}</span>}
              />
            )}

            {proposalUrl && (
              <DetailItem
                icon={<FileCheck className="w-5 h-5 text-secondary" />}
                label={t("request.proposalFile") || "ملف العرض"}
                value={
                  <a
                    href={proposalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-btn hover:shadow-lg"
                  >
                    {t("common.download") || "تحميل الملف"}
                    <FileText className="w-3 h-3" />
                  </a>
                }
              />
            )}

            {/* Full Width Items */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              {description && (
                <div className="relative bg-gray-50/80 rounded-2xl p-6 border border-gray-100 hover:border-primary/20 transition-colors group">
                  <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                    <Info className="w-12 h-12" />
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-primary font-bold">
                    <div className="w-1.5 h-4 bg-secondary rounded-full"></div>
                    {t("request.requestDescription")}
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap relative z-10">
                    {description}
                  </p>
                </div>
              )}
            </div>

            {pricingNotes && (
              <div className="relative bg-amber-50/50 rounded-2xl p-6 border border-amber-100 hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-2 mb-3 text-amber-900 font-bold">
                  <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                  {t("request.notes")}
                </div>
                <p className="text-amber-800 leading-relaxed text-sm whitespace-pre-wrap">
                  {pricingNotes}
                </p>
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
