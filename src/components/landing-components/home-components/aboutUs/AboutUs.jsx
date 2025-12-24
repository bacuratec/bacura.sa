import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // ✅
import NumberBg from "../../../shared/numberBg/NumberBg";
import more from "../../../../assets/icons/moreabout.svg";
import bgabout from "../../../../assets/images/bgabout.png";
import Link from "next/link";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div
      className="relative py-5 sm:py-6 md:py-8 lg:py-10 xl:py-16 bg-primary"
      id="about-us"
    >
      <div className="absolute left-0 top-0 z-10">
        <img src={bgabout} alt="" />
      </div>
      <div className="container">
        {location.pathname === "/" && (
          <div
            className="absolute right-0 xl:-top-20 z-10 text-[#D9D9D9] select-none"
            style={{ mixBlendMode: "soft-light" }}
          >
            <NumberBg number={"02"} />
          </div>
        )}

        <div className="content xl:mt-32 text-white flex flex-col xl:gap-14 lg:gap-12 md:gap-8 sm:gap-6 gap-4 relative z-20">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-6xl font-bold"
          >
            {t("about.title")}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-[550px] text-[#F1F1F1]"
          >
            {t("about.intro")}
          </motion.p>
        </div>

        {/* Button */}
        {location.pathname === "/" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative z-20 w-fit"
          >
            <Link
              href={"/about-us"}
              className="flex items-center rounded-3xl border-[1.5px] px-2 sm:px-3 md:px-4 py-1 md:py-2 lg:py-3 mt-6 sm:mt-8 md:mt-10 lg:mt-16 xl:mt-[100px]"
            >
              <img src={more} alt="" />
              <span className="text-white font-bold text-sm md:text-base xl:text-lg">
                {t("about.more")}
              </span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
