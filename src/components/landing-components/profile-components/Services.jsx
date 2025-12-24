"use client";

import React from "react";
import { AppLink } from "../../../utils/routing";
import { useTranslation } from "react-i18next";

import newService from "../../../assets/icons/newService.svg";
import prevRequests from "../../../assets/icons/prevRequests.svg";
import projectsRunning from "../../../assets/icons/projectsRunning.svg";
import ratesService from "../../../assets/icons/ratesService.svg";

const services = [
  {
    icon: newService,
    alt: "newService",
    href: "/request-service",
  },
  {
    icon: prevRequests,
    alt: "prevRequests",
    href: "/requests",
  },
  {
    icon: projectsRunning,
    alt: "projectsRunning",
    href: "/projects",
  },
  {
    icon: ratesService,
    alt: "ratesService",
    href: "/profile/reviews",
  },
];

const Services = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="font-bold text-xl mb-3">{t("servicesLanding.title")}</h3>
      <div className="grid grid-cols-2 gap-3">
        {services.map((item, i) => (
          <AppLink
            href={item.href}
            key={i}
            className="p-2 md:p-3 lg:p-4 xl:p-5 bg-primary/15 rounded-lg flex flex-col gap-2 md:gap-3 lg:gap-4 xl:gap-5"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <img
                src={item.icon}
                alt={t(`servicesLanding.items.${i}.title`)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-sm md:text-base text-primary">
                {t(`servicesLanding.items.${i}.title`)}
              </h4>
              {/* <p className="text-xs md:text-sm">
                {t(`servicesLanding.items.${i}.description`)}
              </p> */}
            </div>
          </AppLink>
        ))}
      </div>
    </div>
  );
};

export default Services;
