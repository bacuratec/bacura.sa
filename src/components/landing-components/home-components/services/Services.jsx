import React from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import ServiceList from "./ServiceList";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";

const Services = ({ data }) => {
  const { t } = useTranslation();
  const location = useLocation();
  return (
    <section
      id="services"
      className="relative services py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20"
    >
      {/* الخلفية رقم 01 */}
      {location.pathname === "/" && (
        <div className="absolute right-0 top-0 xl:-top-20 z-10 text-[#F1F1F1]">
          <NumberBg number={"01"} />
        </div>
      )}

      {/* المحتوى */}
      <div className="container relative z-20">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-3 sm:gap-6 md:gap-10 lg:gap-12 xl:gap-20 text-center rtl:lg:text-right ltr:lg:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug lg:leading-[60px] lg:basis-[40%]">
            {t("services.title")}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-[#636363] font-medium lg:basis-1/2">
            {t("services.description")}
          </p>
        </div>

        {/* قائمة الخدمات */}
        <div className="mt-6 sm:mt-10 md:mt-16 lg:mt-20 xl:mt-[165px]">
          <ServiceList data={data} />
        </div>
      </div>
    </section>
  );
};

export default Services;
