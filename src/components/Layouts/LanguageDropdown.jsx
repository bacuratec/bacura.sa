import React, { useState, useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import saudiFlag from "@/assets/icons/sarIcon.svg";
import ukFlag from "@/assets/icons/enIcon.svg";
import { FaChevronDown } from "react-icons/fa";

const LanguageDropdown = () => {
  const [open, setOpen] = useState(false);
  const { lang, setLang, changeLanguage } = useContext(LanguageContext);

  const languages = [
    { code: "ar", label: "اللغة العربية", flag: saudiFlag },
    { code: "en", label: "English", flag: ukFlag },
  ];

  const selectedLang = languages.find((l) => l.code === lang);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 transition-all duration-200 mb-1"
      >
        <img
          src={typeof selectedLang.flag === "string" ? selectedLang.flag : (selectedLang.flag?.src || "")}
          alt={selectedLang.label}
          className="w-7 h-7 rounded-full"
        />
        <span className="text-sm font-semibold hidden lg:block">
          {selectedLang.label}
        </span>
        <FaChevronDown className="text-xs mt-0.5" />
      </button>

      {open && (
        <div className="absolute rtl:left-0 ltr:right-0  z-50 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                changeLanguage(language.code);
                setLang(language.code);
                setOpen(false);
                window.location.reload(); // ✅ reload بعد تغيير اللغة
              }}
              className={`flex items-center w-full gap-2 px-4 py-2 text-sm hover:bg-gray-100 ${
                lang === language.code ? "bg-gray-100 font-bold" : ""
              }`}
            >
              <img
                src={typeof language.flag === "string" ? language.flag : (language.flag?.src || "")}
                alt={language.label}
                className="w-5 h-5 rounded-full"
              />
              <span>{language.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
