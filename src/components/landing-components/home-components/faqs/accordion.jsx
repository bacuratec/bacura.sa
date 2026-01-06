"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ChevronDown } from "lucide-react";

const AccordionItem = ({ header, ...rest }) => (
  <Item
    {...rest}
    header={({ state: { isEnter } }) => (
      <>
        {header || "Loading..."}
        <ChevronDown
          className={`mr-auto transition-transform duration-200 ease-out ${isEnter ? "rotate-180" : ""
            }`}
          size={20}
        />
      </>
    )}
    className="pb-4"
    buttonProps={{
      className: ({ isEnter }) =>
        `flex w-full px-4 py-4 bg-[#F1F1F1] hover:bg-primary hover:text-white rounded-t-md font-bold text-lg items-center gap-4 ${isEnter && "bg-primary text-white pt-4 pb-0"
        }`,
    }}
    contentProps={{
      className:
        "transition-height duration-200 ease-out bg-primary rounded-b-md text-white",
    }}
    panelProps={{ className: "p-4" }}
  />
);

const CustomAccordion = ({ questions }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || "ar"; // Default to 'ar' if undefined

  return (
    <div className="mx-2">
      <Accordion transition transitionTimeout={200}>
        {questions?.map((item, i) => {
          // Robust language check
          const isEn = lang && lang.startsWith("en");

          let question = isEn
            ? (item?.question_en || item?.questionString)
            : (item?.question_ar || item?.questionString);

          let answer = isEn
            ? (item?.answer_en || item?.answer)
            : (item?.answer_ar || item?.answer);

          // Fallback if the selected language field is empty but the other exists
          if (!question) question = isEn ? item?.question_ar : item?.question_en;
          if (!answer) answer = isEn ? item?.answer_ar : item?.answer_en;

          return (
            <motion.div
              key={item?.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <AccordionItem
                header={question}
                initialEntered={i === 0}
              >
                {answer}
              </AccordionItem>
            </motion.div>
          );
        })}
      </Accordion>
    </div>
  );
};

export default CustomAccordion;
