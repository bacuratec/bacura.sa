import dayjs from "dayjs";
import { useState } from "react";
import edit from "@/assets/icons/edit.svg";
import ProfileModal from "../../shared/profile-modal/ProfileModal";
import { useTranslation } from "react-i18next";

const WelcomeTitle = ({ name, joinAt, data, refetch }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const formattedDate = dayjs(joinAt).format("DD/MM/YYYY");

  return (
    <div className="flex flex-col gap-4">
      {/* العنوان وزر التعديل */}
      <div className="flex flex-col lg:gap-3">
        <div className="flex items-center justify-between lg:w-1/2">
          <h1 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-[#121417]">
            {t("profile.welcome", { name })}
          </h1>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-primary text-white py-2 px-1 md:px-3 lg:px-4 rounded-lg font-medium"
          >
            <img
              src={edit}
              alt={t("profile.editData")}
              className="lg:w-6 md:w-5 w-4"
            />
            <span className="text-xs md:text-sm lg:text-base">
              {t("profile.editData")}
            </span>
          </button>
        </div>
        <p className="text-[#6B7582] text-xs md:text-sm">
          {t("profile.subtitle")}
        </p>
      </div>

      {/* تاريخ الاشتراك */}
      <div className="w-fit">
        <div className="border border-[#DEE0E3] rounded-lg p-1 md:p-2 lg:p-3 text-base md:text-xl lg:text-2xl font-medium lg:font-bold text-[#121417]">
          {t("profile.joinedSince", { date: formattedDate })}
        </div>
      </div>

      {/* مودال التعديل */}
      <ProfileModal
        open={open}
        setOpen={setOpen}
        data={data}
        refetch={refetch}
      />
    </div>
  );
};

export default WelcomeTitle;
