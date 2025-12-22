import React from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import joinNow from "../../../../assets/images/joinNow.jpg";
import join from "../../../../assets/icons/join.svg";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Join = () => {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);

  return (
    <div className="relative pt-6 sm:pt-8 md:pt-10 lg:pt-16 xl:pt-20 bg-white overflow-hidden">
      {/* رقم الخلفية */}
      <div className="absolute left-5 sm:left-10 -top-8 xl:-top-32 z-10 text-[#F1F1F1]">
        <NumberBg number={"04"} />
      </div>

      <div className="relative z-20">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* صورة الانضمام */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-secondary/10 rounded-[32px] sm:rounded-xl p-4 sm:p-6 w-full max-w-[550px] shadow-md"
            >
              <div className="w-full h-full rounded-xl overflow-hidden">
                <img
                  src={joinNow}
                  alt="Join Now"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </motion.div>

            {/* المحتوى */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col gap-4 md:gap-6 xl:gap-8 rtl:lg:text-right ltr:lg:text-left w-full lg:max-w-xl"
            >
              <h4 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-[#252B42] leading-snug">
                {t("join.title")}
              </h4>
              <p className="text-[#737373] text-sm md:text-base leading-relaxed">
                {t("join.description")}
              </p>
              <Link
                to={role === "Requester" ? "/request-service" : "signup"}
                className="flex items-center gap-2 self-start sm:self-end mt-4 sm:mt-6 lg:mt-10"
              >
                <span className="font-bold text-sm sm:text-base text-primary">
                  {role === "Requester" ? t("join.request") : t("join.signup")}
                </span>
                <img
                  src={join}
                  alt="join"
                  className="w-4 sm:w-5 ltr:rotate-180"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Join;
