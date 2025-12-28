"use client";

import React, { useContext, useRef, useEffect } from "react";
import ServiceCard from "./ServiceCard";
import s1 from "../../../../assets/icons/s1.svg";
import s2 from "../../../../assets/icons/s2.svg";
import s3 from "../../../../assets/icons/s3.svg";
import { AppLink } from "../../../../utils/routing";
import { LanguageContext } from "@/context/LanguageContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ServiceList = ({ data }) => {
  const { lang } = useContext(LanguageContext);
  const icons = [s1, s2, s3];
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      gsap.from(".service-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <div className="container">
        <div
          className={`servicesList grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8`}
        >
          {data?.length &&
            data.map((item, index) => (
              <div
                key={item.id || index}
                className="service-item"
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
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
