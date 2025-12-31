import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { getAppBaseUrl } from "../../../utils/env";

const UserData = ({ data }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const {
    full_name: fullName,
    email,
    phone: phoneNumber,
    creation_time: creationTime,
    commercial_registration_number: commercialRegistrationNumber,
    entity_type: entityType,
    city,
    commercial_registration_date: commercialRegistration,
  } = (data?.user || data);

  const joiningDateFormatted = new Date(creationTime).toLocaleDateString(
    "ar-EG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  const commercialRegistrationDate = new Date(
    commercialRegistration
  ).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const base = getAppBaseUrl();
  // href={`${base}${row?.filePathUrl}`}
  return (
    <section className="sm:py-2 md:py-3 lg:py-5">
      <div className="rounded-lg md:rounded-xl lg:rounded-2xl bg-white shadow-sm p-3 md:p-4 lg:p-5 xl:p-6 flex flex-col lg:flex-row justify-between gap-6">
        {/* البيانات */}
        <div className="flex items-center xl:gap-10 lg:gap-8 md:gap-5 sm:gap-3 gap-2 flex-wrap">
          <div className="shrink-0 profile w-[150px] h-[150px] bg-gray-500 rounded-xl col-span-1 overflow-hidden">
            <img
              src={data?.profile_picture_url ? `${base}${data.profile_picture_url}` : "/vite.png"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="profile rounded-xl col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("userData.fullName")}:
                </span>
                <span>{fullName || data?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("userData.email")}:
                </span>
                <span>{email || data?.user?.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("userData.phone")}:
                </span>
                <span>{phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {t("userData.registrationDate")}:
                </span>
                <span>{creationTime ? new Date(creationTime).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US") : "-"}</span>
              </div>
              {commercialRegistrationNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    {t("userData.commercialNumber")}:
                  </span>
                  <span>{commercialRegistrationNumber}</span>
                </div>
              )}
              {commercialRegistrationDate && (
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    {t("userData.commercialDate")}:
                  </span>
                  <span>{commercialRegistrationDate}</span>
                </div>
              )}
              {entityType && (
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    {t("userData.entityType")}:
                  </span>
                  <span>
                    {lang === "ar" ? (entityType.name_ar || entityType.nameAr) : (entityType.name_en || entityType.nameEn)}
                  </span>
                </div>
              )}
              {city && (
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    {t("userData.workRegion")}:
                  </span>
                  <span> {lang === "ar" ? (city.name_ar || city.nameAr) : (city.name_en || city.nameEn)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserData;
