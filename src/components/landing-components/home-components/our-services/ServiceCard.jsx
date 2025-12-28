import React from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";

const ServiceCard = ({ icon, imageUrl, title, description, index }) => {
  return (
    <div
      title={description}
      className="relative h-auto min-h-auto lg:h-[226px] rounded-[20px] sm:rounded-[30px] bg-[#F8F8F8] transition-all duration-300 hover:bg-primary hover:text-white cursor-pointer group p-4 sm:p-6 flex flex-col justify_between"
    >
      {/* رقم الخدمة */}
      <span className="absolute top-4 left-4 text-sm sm:text-base text-gray-400 group-hover:text-white">
        {index}
      </span>

      {/* محتوى البطاقة */}
      <div className="flex flex-col justify-around h-full gap-4">
        {/* الأيقونة / الصورة */}
        <div className="icon rounded-xl sm:rounded-2xl bg-[#F1F1F1] group-hover:bg-[#2374BD] p-2 sm:p-3 w-fit flex items-center justify-center text-primary">
          <OptimizedImage src={imageUrl || icon} alt={title || "Service"} width={32} height={32} />
        </div>

        {/* النصوص */}
        <div className="text flex flex-col gap-2 sm:gap-4">
          <h3 className="font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-[#525252] group-hover:text-[#C8C8C8] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
