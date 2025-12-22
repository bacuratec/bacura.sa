import React from "react";
import { motion } from "framer-motion"; // ✅ استيراد موشن
import subscripeArrow from "../../../../assets/icons/subscripeArrow.svg";
import HowItWorkCard from "./HowItWorkCard";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const HowItWorkList = () => {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);

  const howItWork = [
    {
      id: 1,
      title: t("howItWorks.step1"),
    },
    {
      id: 2,
      title: t("howItWorks.step2"),
    },
    {
      id: 3,
      title: t("howItWorks.step3"),
      link: {
        name:
          role === "Requester"
            ? t("howItWorks.requestService")
            : t("howItWorks.subscribeNow"),
        icon: subscripeArrow,
        href: role === "Requester" ? "/request-service" : "/signup",
      },
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {howItWork?.map((item, i) => (
        <motion.div
          key={item?.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.2 }}
          viewport={{ once: true }}
        >
          <HowItWorkCard item={item} />
        </motion.div>
      ))}
    </div>
  );
};

export default HowItWorkList;
