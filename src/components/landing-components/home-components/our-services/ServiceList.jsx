"use client";

import React, { useContext } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // ✅ استيراد Framer Motion
import ServiceCard from "./ServiceCard";
import s1 from "../../../../assets/icons/s1.svg";
import s2 from "../../../../assets/icons/s2.svg";
import s3 from "../../../../assets/icons/s3.svg";
import { LanguageContext } from "@/context/LanguageContext";
import { AppLink } from "../../../../utils/routing";
import { useSelector } from "react-redux";

const ServiceList = ({ data }) => {
  const icons = [s1, s2, s3];
  const { lang } = useContext(LanguageContext);
  const userId = useSelector((state) => state.auth.userId);

  return (
    <div>
      <div className="container">
        <div className="servicesList grid grid-cols-1 gap-3">
          {data?.length &&
            data.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <AppLink
                  href="/request-service"
                >
                  <ServiceCard
                    index={index + 1}
                    icon={icons[index] || s1}
                    title={lang === "ar" ? item.titleAr : item.titleEn}
                    description={
                      lang === "ar" ? item.descriptionAr : item.descriptionEn
                    }
                  />
                </AppLink>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
