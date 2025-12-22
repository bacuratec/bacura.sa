import heroImg from "../../../../assets/images/hero.jpg";
import seeMore from "../../../../assets/icons/seeMore.svg";
import arrowSeeMore from "../../../../assets/icons/arrowSeeMore.svg";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);

  return (
    <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[80vh] xl:h-[calc(100vh-75px)] overflow-hidden">
      <div className="w-full h-full relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-[#1967AE33] before:z-10">
        <div className="w-full h-full relative">
          <img src={heroImg} className="w-full h-full object-fill" />
          <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="absolute top-1/2 left-1/2 z-20 text-white text-center -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-4xl mx-auto">
          <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-snug">
            {t("hero.title")}
          </h1>
          <Link
            to={role === "Requester" ? "/request-service" : "signup"}
            className="mt-6 inline-block py-1 lg:py-2 px-3 md:px-4 lg:px-6 bg-primary text-white text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-medium rounded-lg"
          >
            {role === "Requester"
              ? t("hero.requestService")
              : t("hero.registerNow")}
          </Link>
        </div>
      </div>

      {/* See More Button */}
      <div className="seemore absolute -bottom-4 left-0 z-40 w-full max-w-xs hidden md:block">
        <div className="relative">
          <img src={seeMore} alt="عرض المزيد" className="w-full" />
          <a
            href={"#services"}
            className="cursor-pointer absolute left-[46%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary flex flex-col items-center justify-center"
          >
            <img
              src={arrowSeeMore}
              alt="سهم"
              className="animate-bounce w-6 sm:w-8"
            />
            <span className="text-sm sm:text-base md:text-lg">
              {t("hero.seeMore")}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
