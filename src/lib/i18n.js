import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import your translations
import translationsEN from "@/locales/en.json";
import translationsAR from "@/locales/ar.json";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: translationsEN,
      },
      ar: {
        translation: translationsAR,
      },
    },
    lng: process.env.NEXT_PUBLIC_DEFAULT_LANG || "ar", // default language
    fallbackLng: process.env.NEXT_PUBLIC_DEFAULT_LANG || "ar", // fallback language
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;

