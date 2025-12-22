import React from "react";
import { motion } from "framer-motion"; // ✅ استيراد Framer Motion
import NumberBg from "../../../shared/numberBg/NumberBg";
import CustomAccordion from "./accordion";
import { useLocation } from "react-router-dom";
import { useGetQuestionsQuery } from "../../../../redux/api/faqsApi";
import { useTranslation } from "react-i18next";

const Faqs = () => {
  const { t } = useTranslation();
  const { data: questions } = useGetQuestionsQuery();

  const location = useLocation();

  return (
    <div className="py-5">
      {location.pathname !== "/" && <title>{t("faqs.title")}</title>}
      <div className="container" id="faqs">
        <div className="faqsHeader flex items-center justify-between flex-col md:flex-row">
          {location.pathname === "/" ? (
            <div className="relative text-[#F1F1F1] xl:leading-[280px] lg:leading-[200px] md:leading-[150px] leading-[100px]">
              <NumberBg number={"05"} />
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-nowrap absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 font-bold text-xl md:text-2xl lg:text-4xl xl:text-[64px] w-full z-10 text-black"
              >
                {t("faq")}
              </motion.h2>
            </div>
          ) : (
            <h2 className="text-primary font-bold text-xl md:text-3xl lg:text-6xl py-10">
              {t("faq")}
            </h2>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <CustomAccordion questions={questions} />
        </motion.div>
      </div>
    </div>
  );
};

export default Faqs;
