import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css"; // الأساسي - إجباري
import "swiper/css/free-mode";
import "swiper/css/autoplay"; // أحيانًا مفيد لو autoplay مش شغال كويس
import NumberBg from "../../../shared/numberBg/NumberBg";
import { useGetCustomersQuery } from "../../../../redux/api/customersApi";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Customers = () => {
  const { t } = useTranslation();
  const { data: customers } = useGetCustomersQuery();
  if (!customers || customers?.length === 0) {
    return;
  }
  return (
    <section id="customers" className="bg-white">
      <div className="container">
        <div className="faqsHeader flex items-center justify-between flex-col md:flex-row">
          <div className="relative text-[#F1F1F1] xl:leading-[200px] lg:leading-[150px] md:leading-[100px] leading-[60px]">
            <NumberBg number={"07"} />
            <h2 className="text-nowrap absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2 font-bold text-xl md:text-2xl lg:text-4xl xl:text-[64px] w-full z-10 text-black">
              {t("customers.titleHero")}
            </h2>
          </div>
        </div>
      </div>
      <section className="mt-5">
        <div className="container">
          <Swiper
            draggable={true}
            autoplay={{
              delay: 0, // عشان يتحرك من غير توقف
              disableOnInteraction: false, // يكمل الحركة حتى لو حصل تفاعل
              pauseOnMouseEnter: false, // يستمر في الحركة حتى لو الماوس دخل على اللوجوهات
            }}
            speed={2000} // سرعة الحركة - أسرع يعني يتحرك بسرعة أكبر
            loop={true} // يعيد اللوجوهات من الأول بعد ما يخلص
            freeMode={true} // يخلي الحركة حرة ومستمرة
            modules={[Autoplay, FreeMode]}
            breakpoints={{
              280: {
                slidesPerView: 3, // عدد اللوجوهات للشاشات الصغيرة جداً (موبايل)
                spaceBetween: 10,
              },
              480: {
                slidesPerView: 4, // للشاشات الموبايل المتوسطة
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 5, // للشاشات التابلت
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 6, // للشاشات الكبيرة مثل اللابتوب والديسكتوب
                spaceBetween: 20,
              },
            }}
            className=""
            dir="ltr"
          >
            {customers?.map((logo, i) =>
              logo ? (
                <SwiperSlide key={i} className="my-5 cursor-pointer">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative w-full lg:h-[200px] h-[150px] rounded-xl overflow-hidden shadow-md">
                      <img
                        src={logo?.imageBase64}
                        alt={`brand-logo-${i}`}
                        className="w-full h-full object-fill"
                      />
                    </div>
                    {/* <h3 className="text-lg font-semibold text-gray-700">
                      {logo?.name}
                    </h3> */}
                  </motion.div>
                </SwiperSlide>
              ) : null
            )}
          </Swiper>
        </div>
      </section>
    </section>
  );
};

export default Customers;
