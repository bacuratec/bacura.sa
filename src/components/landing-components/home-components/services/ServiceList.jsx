"use client";

import React, { useContext, useRef, useEffect, useMemo } from "react";
import ServiceCard from "./ServiceCard";
import s1 from "../../../../assets/icons/s1.svg";
import s2 from "../../../../assets/icons/s2.svg";
import s3 from "../../../../assets/icons/s3.svg";
import { AppLink } from "../../../../utils/routing";
import { LanguageContext } from "@/context/LanguageContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SkeletonCard } from "../../../shared/skeletons/Skeleton";

const ServiceList = ({ data, isLoading }) => {
  const { lang } = useContext(LanguageContext);
  const icons = [s1, s2, s3];
  const containerRef = useRef(null);

  const items = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item, idx) => {
      const title =
        (lang === "ar" ? item.titleAr : item.titleEn) ||
        (lang === "ar" ? item.name_ar : item.name_en) ||
        "خدمة";
      const description =
        (lang === "ar" ? item.descriptionAr : item.descriptionEn) ||
        (lang === "ar" ? item.description_ar : item.description_en) ||
        item.description ||
        "";
      const price = item.price ?? item.base_price ?? null;
      const imageUrl = item.image_url || item.imageUrl || null;
      const isActive = item.is_active;
      return {
        id: item.id,
        index: idx + 1,
        title,
        description,
        price,
        imageUrl,
        isActive,
        icon: icons[idx % icons.length] || s1,
      };
    });
  }, [data, lang]);

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

  if (isLoading) {
    return (
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="container">
        <div
          className={`servicesList grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8`}
        >
          {items.length > 0 &&
            items.map((item) => (
              <div
                key={item.id || item.index}
                className="service-item"
              >
                <ServiceCard
                  index={item.index}
                  icon={item.icon}
                  imageUrl={item.imageUrl}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  isActive={item.isActive}
                  lang={lang}
                />
              </div>
            ))}
          {items.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500 py-10">
              لا توجد خدمات متاحة حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
