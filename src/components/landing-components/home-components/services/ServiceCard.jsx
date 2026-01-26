import Link from "next/link";
import React from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { ServiceIcon } from "@/constants/servicesData";
import { motion } from "framer-motion";

const ServiceCard = ({ icon, title, description, index, isActive, color }) => {
  return (
    <motion.div
      title={description}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="relative rounded-2xl bg-[#F8F8F8] transition-shadow duration-300 hover:shadow-custom group p-4 sm:p-6 flex flex-col gap-4 h-full"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm sm:text-base text-gray-400">{index}</span>

      </div>

      <div className="flex items-center gap-3">
        {/* Render Icon Component if available, otherwise fallback to image/old behavior */}
        <ServiceIcon icon={icon} color={color} size={32} />

        {isActive === false ? (
          <span className="text-xs text-red-600 font-bold">قريباً سيتم إطلاقها</span>
        ) : (
          <span className="text-xs text-green-600 font-bold">متاحة</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-base sm:text-lg md:text-xl">{title}</h3>
        <p className="text-sm sm:text-base text-[#525252] leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      <div className="flex justify-end mt-auto">
        <Link href="/request-service">
          <motion.span whileTap={{ scale: 0.95 }} className="btn btn-primary inline-block">
            اطلب الخدمة
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
