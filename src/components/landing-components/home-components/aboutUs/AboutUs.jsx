import React, { useEffect, useRef } from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import more from "../../../../assets/icons/moreabout.svg";
import bgabout from "../../../../assets/images/bgabout.png";
import Link from "next/link";
import Image from "next/image";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const AboutUs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // Animate Title
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Animate Description
      gsap.from(descRef.current, {
        scrollTrigger: {
          trigger: descRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      // Animate Button (only if present)
      if (btnRef.current) {
        gsap.from(btnRef.current, {
          scrollTrigger: {
            trigger: btnRef.current,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      className="relative py-5 sm:py-6 md:py-8 lg:py-10 xl:py-16 bg-primary overflow-hidden"
      id="about-us"
    >
      <div className="absolute left-0 top-0 z-10 w-full h-full">
        <Image src={bgabout} alt="" fill className="object-cover opacity-20" />
      </div>
      <div className="container relative">
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
          <h2
            ref={titleRef}
            className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-6xl font-bold"
          >
            {t("about.title")}
          </h2>

          {/* Description */}
          <p
            ref={descRef}
            className="max-w-[550px] text-[#F1F1F1]"
          >
            {t("about.intro")}
          </p>
        </div>

        {/* Button */}
        {location.pathname === "/" && (
          <div
            ref={btnRef}
            className="relative z-20 w-fit"
          >
            <Link
              href={"/about-us"}
              className="flex items-center rounded-3xl border-[1.5px] px-2 sm:px-3 md:px-4 py-1 md:py-2 lg:py-3 mt-6 sm:mt-8 md:mt-10 lg:mt-16 xl:mt-[100px] hover:bg-white/10 transition-colors"
            >
              <Image src={more} alt="" className="w-6 h-6" />
              <span className="text-white font-bold text-sm md:text-base xl:text-lg mx-2">
                {t("about.more")}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
