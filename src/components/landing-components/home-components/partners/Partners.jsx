import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css"; // الأساسي - إجباري
import "swiper/css/free-mode";
import "swiper/css/autoplay"; // أحيانًا مفيد لو autoplay مش شغال كويس
import NumberBg from "../../../shared/numberBg/NumberBg";
import { useGetPartnersQuery } from "../../../../redux/api/partnersApi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { normalizeImageSrc } from "@/utils/image";

const Partners = () => {
  const { t } = useTranslation();
  const { data: partners } = useGetPartnersQuery();
  const hasPartners = Array.isArray(partners) && partners.length > 0;
  // لو عدد الشركاء أقل من عدد الشرائح المعروضة، نلغي الـ loop لتفادي تحذير Swiper
  const canLoop = (partners?.length || 0) >= 6;
  return (
    <section id="partners" className="bg_white">
      <div className="container">
        <div className="faqsHeader flex items-center justify-between flex-col md:flex-row">
          <div className="relative text-[#F1F1F1] xl:leading-[200px] lg:leading-[150px] md:leading-[100px] leading-[60px]">
            <NumberBg number={"06"} />
            <h2 className="text-nowrap absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2 font-bold text-xl md:text-2xl lg:text-4xl xl:text-[64px] w-full z-10 text_black">
              {t("partners.titleHero")}
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm sm:text_base md:text-lg text-[#636363] font_medium text_center md:text_right">
          {t("partners.description")}
        </p>
      </div>
      <section className="mt-5">
        <div className="container">
          {hasPartners ? (
            <Swiper
              draggable={true}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}
              speed={2000}
              loop={canLoop}
              freeMode={true}
              modules={[Autoplay, FreeMode]}
              breakpoints={{
                280: { slidesPerView: 3, spaceBetween: 10 },
                480: { slidesPerView: 4, spaceBetween: 10 },
                768: { slidesPerView: 5, spaceBetween: 20 },
                1024: { slidesPerView: 6, spaceBetween: 20 },
              }}
              className=""
              dir="ltr"
            >
              {partners?.map((logo, i) =>
                logo ? (
                  <SwiperSlide key={i} className="my-5 cursor-pointer">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="relative w-full lg:h-[200px] h-[150px] rounded-xl overflow-hidden shadow-md bg_white border border_gray_200">
                        <OptimizedImage
                          src={normalizeImageSrc(logo?.imageBase64 || logo?.imageUrl || logo?.image_url)}
                          alt={`brand-logo-${i}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="w-full h-full object_contain"
                        />
                      </div>
                      {logo?.name ? (
                        <p className="mt-2 text_center text-xs text_gray_600">{logo.name}</p>
                      ) : null}
                    </motion.div>
                  </SwiperSlide>
                ) : null
              )}
            </Swiper>
          ) : (
            <div className="text_center text_sm text_gray_500 py_10">
              لا توجد شعارات شركاء متاحة حالياً
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default Partners;
