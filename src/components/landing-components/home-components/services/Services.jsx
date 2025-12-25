import React, { useEffect, useRef } from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import ServiceList from "./ServiceList";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Services = ({ data }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate Header
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        }
      });

      tl.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      })
      .from(descRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.3")
      .from(listRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.3");

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
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
          <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug lg:leading-[60px] lg:basis-[40%]">
            {t("services.title")}
          </h2>

          <p ref={descRef} className="text-sm sm:text-base md:text-lg text-[#636363] font-medium lg:basis-1/2">
            {t("services.description")}
          </p>
        </div>

        {/* قائمة الخدمات */}
        <div ref={listRef} className="mt-6 sm:mt-10 md:mt-16 lg:mt-20 xl:mt-[165px]">
          <ServiceList data={data} />
        </div>
      </div>
    </section>
  );
};

export default Services;
