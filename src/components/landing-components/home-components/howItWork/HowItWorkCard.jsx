"use client";

import React from "react";
import { AppLink } from "../../../../utils/routing";
import Image from "next/image";
import { motion } from "framer-motion";

const HowItWorkCard = ({ item }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="px-3 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-3 md:py-4 lg:py-6 xl:py-8 bg-[#F5F5F5] rounded-lg md:rounded-xl xl:rounded-[32px] flex gap-4 transition-shadow hover:shadow-lg"
    >
      <div className="shrink-0 number rounded-full bg-primary text-white p-1 lg:w-10 lg:h-10 md:w-8 md:h-8 w-6 h-6 flex items-center justify-center font-semibold text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl">
        {item?.id}
      </div>
      <div className="des flex flex-col gap-3 px-2 sm:px-0">
        <h3 className="font-bold text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-[28px]">{item?.title}</h3>
        <p className="text-black/65 text-xs sm:text-sm md:text-lg">
          {item?.description}
        </p>

        {item?.link && (
          <AppLink href={item?.link?.href} className="w-full sm:w-fit self-center sm:self-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 py-2 sm:py-3 px-4 sm:px-6 border border-primary rounded-full cursor-pointer"
            >
              <span className="font-medium text-sm md:text-base lg:text-lg text-primary">
                {item?.link?.name}
              </span>
              <Image
                src={item?.link?.icon}
                alt={item?.link?.name}
                className="w-4 sm:w-5 ltr:rotate-180"
              />
            </motion.div>
          </AppLink>
        )}
      </div>
    </motion.div>
  );
};

export default HowItWorkCard;
