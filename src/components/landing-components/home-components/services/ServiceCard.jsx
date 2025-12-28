import React from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";

const ServiceCard = ({ icon, imageUrl, title, description, price, index, isActive }) => {
  return (
    <div
      title={description}
      className="relative rounded-2xl bg-[#F8F8F8] transition-all duration-300 hover:shadow-custom group p-4 sm:p-6 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm sm:text-base text-gray-400">{index}</span>
        {price !== null && price !== undefined ? (
          <span className="inline-flex items-center rounded-lg bg-primary/10 text-primary px-2 py-1 text-xs sm:text-sm">
            {price} ر.س
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#F1F1F1] p-3 w-fit flex items-center justify-center text-primary">
          <OptimizedImage src={imageUrl || icon} alt={title || ""} width={40} height={40} />
        </div>
        {isActive === false ? (
          <span className="text-xs text-red-600">غير متاحة حالياً</span>
        ) : (
          <span className="text-xs text-green-600">متاحة</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-base sm:text-lg md:text-xl">{title}</h3>
        <p className="text-sm sm:text-base text-[#525252] leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      <div className="flex justify-end">
        <a href="/request-service" className="btn btn-primary">
          اطلب الخدمة
        </a>
      </div>
    </div>
  );
};

export default ServiceCard;
