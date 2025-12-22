import React from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import Polygon from "../../../../assets/icons/Polygon.svg";
import howImg from "../../../../assets/images/howImg.jpg";
import HowItWorkList from "./HowItWorkList";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HowItWork = () => {
  const { t } = useTranslation();
  const location = useLocation();
  return (
    <div
      className="relative w-full py-6 sm:pb-10 md:pb-12 lg:pb-20 xl:pb-28"
      id="how-it-work"
    >
      {/* رقم الخلفية */}
      {location.pathname === "/" && (
        <div className="absolute left-1/2 -translate-x-1/2 top-0 md:-top-10 lg:-top-12 xl:-top-24 z-0 text-[#F1F1F1] block ">
          <NumberBg number={"03"} />
        </div>
      )}

      {/* العنوان */}
      <div className="w-full absolute left-1/2 -translate-x-1/2 top-16  xl:top-36 z-10 text-center px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-[56px] font-bold text-black/85">
          {t("howItWorks.title")}
        </h2>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mt-32 md:mt-44 lg:mt-52 xl:mt-[300px]">
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-5">
          {/* صورة وديزاين */}
          <div className="bg-[#1967AE5C] rounded-[32px] sm:rounded-lg relative py-5 px-6 sm:px-5 w-full lg:basis-1/2 max-w-[550px]">
            <div className="relative w-full h-full">
              {/* <img src={Polygon} alt="" className="w-full" /> */}
              <img
                src={howImg}
                alt=""
                className="w-full h-full object-cover polygon-clip rounded-lg"
              />
            </div>
          </div>

          {/* لستة خطوات العمل */}
          <div className="content w-full lg:basis-1/2 px-4">
            <HowItWorkList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWork;
