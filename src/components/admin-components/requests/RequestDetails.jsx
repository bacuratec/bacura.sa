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
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";

const DetailItem = ({ icon, label, value, subValue, highlight }) => (
  <div className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 group hover:shadow-md ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-100 hover:border-primary/20'}`}>
    <div className="flex items-center gap-2.5 text-sm text-gray-500 font-medium group-hover:text-primary transition-colors">
      <div className={`p-2 rounded-xl transition-colors ${highlight ? 'bg-white text-primary shadow-sm' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
        {icon}
      </div>
      {label}
    </div>
    <div className="text-gray-900 font-bold text-base px-1">
      {value || <span className="text-gray-300 italic text-sm">--</span>}
      {subValue && <div className="mt-1">{subValue}</div>}
    </div>
  </div>
);

const RequestDetails = ({ data, isClient = false }) => {
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

  // Hide provider info for client
  const providerAssignedAt = !isClient ? (data?.provider_assigned_at || null) : null;
  const providerName = !isClient ? (data?.provider?.name || (data?.provider_id ? String(data.provider_id).slice(0, 8) + "..." : null)) : null;

  const joiningDateFormatted = dayjs(creationTime).format("DD/MM/YYYY hh:mm A");

  return (
    <section className="py-2 animate-fade-in-up">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Header Section */}
        <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-gray-100">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t("requestDetails.title", "تفاصيل الطلب")}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 font-mono">#{requestNumber}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${['priced', 'paid', 'completed', 'rated'].includes(requestStatus?.code)
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                  {lang === "ar"
                    ? (requestStatus?.name_ar || requestStatus?.nameAr)
                    : (requestStatus?.name_en || requestStatus?.nameEn)
                  }
                </span>
              </div>
            </div>
          </div>

          {price && (
            <div className="bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <DollarSign className="w-4 h-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">{t("request.price", "قيمة الطلب")}</span>
                <span className="text-lg font-black text-gray-800 font-mono leading-none">
                  {formatCurrency(price, lang)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <DetailItem
              icon={<User className="w-5 h-5" />}
              label={t("request.name", "اسم مقدم الطلب")}
              value={fullName}
            />

            <DetailItem
              icon={<Calendar className="w-5 h-5" />}
              label={t("request.registrationDate", "تاريخ الطلب")}
              value={<span suppressHydrationWarning className="dir-ltr block text-right">{joiningDateFormatted}</span>}
            />

            {providerName && (
              <DetailItem
                icon={<UserCheck className="w-5 h-5" />}
                label={t("request.provider", "مزوّد الخدمة")}
                highlight={true}
                value={
                  <div className="flex flex-col gap-2">
                    <span>{providerName}</span>
                    {data?.provider_response && (
                      <span className={`inline-flex items-center gap-1.5 w-fit px-2 py-1 rounded-md text-[10px] font-bold ${data.provider_response === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : data.provider_response === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                        {data.provider_response === 'accepted' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            {t("AdminAssignProvider.accepted", "تم القبول")}
                          </>
                        ) : data.provider_response === 'rejected' ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            {t("AdminAssignProvider.rejected", "تم الرفض")}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            {t("AdminAssignProvider.pending", "بانتظار الرد")}
                          </>
                        )}
                      </span>
                    )}
                  </div>
                }
              />
            )}

            {providerAssignedAt && (
              <DetailItem
                icon={<Clock className="w-5 h-5" />}
                label={t("request.providerAssignedAt", "تاريخ التعيين")}
                value={<span suppressHydrationWarning className="dir-ltr block text-right">{dayjs(providerAssignedAt).format("DD/MM/YYYY hh:mm A")}</span>}
              />
            )}

            {proposalUrl && (
              <DetailItem
                icon={<FileCheck className="w-5 h-5" />}
                label={t("request.proposalFile", "ملف العرض")}
                value={
                  <a
                    href={proposalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold underline transition-colors"
                  >
                    {t("common.download", "تحميل الملف")}
                    <FileText className="w-4 h-4" />
                  </a>
                }
              />
            )}

            {/* Description - Full Width */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-secondary" />
                {t("request.requestDescription", "وصف الطلب")}
              </h3>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                {description || t("noDescription", "لا يوجد وصف")}
              </div>
            </div>

            {pricingNotes && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  {t("request.notes", "ملاحظات التسعير")}
                </h3>
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-amber-800 leading-relaxed text-sm whitespace-pre-wrap">
                  {pricingNotes}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default RequestDetails;
