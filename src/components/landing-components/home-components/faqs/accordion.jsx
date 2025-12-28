import React from "react";
import { motion } from "framer-motion"; // ✅ استيراد Framer Motion
import bottomArrow from "../../../../assets/icons/bottomArrow.svg";
import topArrow from "../../../../assets/icons/topArrow.svg";
import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";

const AccordionItem = ({ header, ...rest }) => (
  <Item
    {...rest}
    header={({ state: { isEnter } }) => (
      <>
        {header}
        <img
          className={`mr-auto transition-transform duration-200 ease-out`}
          src={isEnter ? topArrow : bottomArrow}
          alt="Chevron"
        />
      </>
    )}
    className="pb-4"
    buttonProps={{
      className: ({ isEnter }) =>
        `flex w-full px-4 py-4 bg-[#F1F1F1] hover:bg-primary hover:text-white rounded-t-md font-bold text-lg ${
          isEnter && "bg-primary text-white pt-4 pb-0"
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
  return (
    <div className="mx-2">
      <Accordion transition transitionTimeout={200}>
        {questions?.map((item, i) => (
          <motion.div
            key={item?.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <AccordionItem
              header={item?.questionString}
              initialEntered={i === 0}
            >
              {item?.answer}
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
};

export default CustomAccordion;
