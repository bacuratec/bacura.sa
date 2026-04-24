import React, { useContext } from "react";
import { useToggleBlockUserMutation } from "../../../redux/api/authApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { getAppBaseUrl } from "../../../utils/env";
import { formatDate } from "@/utils/format";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Hash,
  Activity,
  Briefcase
} from "lucide-react";

/**
 * UserData Component
 * Displays detailed information about a provider or requester with a premium UI.
 */
const UserData = ({ data, refetch }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const isArabic = lang === "ar";
  const base = getAppBaseUrl();

  const {
    name: fullName,
    email,
    phoneNumber,
    creationTime,
    commercialRegistrationDate,
    commercialRegistrationNumber,
    profileStatus,
    entityType,
    city,
    user,
    specialization,
    bio
  } = data;

  // Use the robust formatDate utility
  const joiningDateFormatted = formatDate(creationTime || user?.created_at, "D MMMM YYYY", lang);
  const registrationDateFormatted = formatDate(commercialRegistrationDate, "D MMMM YYYY", lang);

  const [toggleBlockUser, { isLoading: isToggleLoading }] = useToggleBlockUserMutation();

  const handleToggleBlock = async () => {
    try {
      const userId = user?.id;
      const currentlyBlocked = !!user?.is_blocked;
      await toggleBlockUser({ userId, isBlocked: !currentlyBlocked }).unwrap();
      toast.success(!currentlyBlocked ? t("user.user_blocked_success") : t("user.user_activated_success"));
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || t("user.toggleError") || "حدث خطأ أثناء تغيير حالة المستخدم");
    }
  };

  const isBlocked = !!user?.is_blocked;

  const InfoItem = ({ icon: Icon, label, value, colorClass = "text-primary" }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform ${colorClass}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-semibold text-gray-700 leading-tight">{value || "-"}</span>
      </div>
    </div>
  );

  return (
    <section className="py-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl p-1 md:p-8">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-10">
          {/* Left Column: Profile Card */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="relative group mx-auto lg:mx-0">
              <div className="w-56 h-56 rounded-[2rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-500">
                {data?.profilePictureUrl ? (
                  <img
                    src={`${base}${data.profilePictureUrl}`}
                    alt={fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <User size={80} strokeWidth={1} />
                    <span className="text-xs mt-2">{t("common.noProfilePicture") || "لا توجد صورة"}</span>
                  </div>
                )}
              </div>
              
              {/* Status Badge Over Image */}
              <div className="absolute -bottom-3 -right-3 px-6 py-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-2 text-xs font-bold transition-all text-white animate-in zoom-in"
                style={{ 
                  backgroundColor: profileStatus?.id === 201 ? '#10b981' : '#f59e0b'
                }}>
                <Activity size={14} className="animate-pulse" />
                {isArabic ? profileStatus?.nameAr : profileStatus?.nameEn}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-center lg:text-right">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{fullName}</h2>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-400">
                <Hash size={14} />
                <span className="text-xs font-mono select-all">UID: {user?.id}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                disabled={isToggleLoading}
                onClick={handleToggleBlock}
                className={`flex items-center justify-center gap-3 w-full h-14 rounded-2xl font-bold transition-all duration-300 ${
                  isBlocked 
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-emerald-100" 
                    : "bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-rose-100"
                } shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-50`}
              >
                {isBlocked ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                {isBlocked ? t("user.activate") : t("user.block")}
              </button>
            </div>
          </div>

          {/* Right Column: Detailed Information Grid */}
          <div className="lg:w-2/3 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem 
                icon={Mail} 
                label={t("user.email")} 
                value={email || user?.email} 
              />
              <InfoItem 
                icon={Phone} 
                label={t("user.phone_number")} 
                value={phoneNumber || user?.phone} 
              />
              <InfoItem 
                icon={Calendar} 
                label={t("user.registration_date")} 
                value={joiningDateFormatted} 
              />
              <InfoItem 
                icon={Briefcase} 
                label={t("user.role")} 
                value={user?.role} 
                colorClass="text-indigo-500"
              />
              <InfoItem 
                icon={UserPlus} 
                label={t("user.entity_type")} 
                value={isArabic ? entityType?.nameAr : entityType?.nameEn} 
                colorClass="text-amber-500"
              />
              <InfoItem 
                icon={MapPin} 
                label={t("user.city")} 
                value={isArabic ? city?.nameAr : city?.nameEn} 
                colorClass="text-rose-500"
              />
            </div>

            {/* Commercial Info Card */}
            {(commercialRegistrationNumber || commercialRegistrationDate) && (
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FileText size={16} />
                  {t("user.commercial_info") || "معلومات السجل التجاري"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">{t("user.commercial_registration")}</span>
                    <span className="text-base font-bold text-gray-700">{commercialRegistrationNumber || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">{t("user.commercial_registration_confirmation_date")}</span>
                    <span className="text-base font-bold text-gray-700">{registrationDateFormatted}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Specialization & Bio if Provider */}
            {(specialization || bio) && (
              <div className="grid grid-cols-1 gap-6">
                {specialization && (
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Activity size={16} />
                      {t("user.specialization") || "التخصص"}
                    </h3>
                    <p className="text-sm font-bold text-gray-700">{specialization}</p>
                  </div>
                )}
                {bio && (
                  <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      {t("user.bio") || "النبذة التعريفية"}
                    </h3>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"{bio}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserData;
