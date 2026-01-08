"use client";

import Link from "next/link";

import {
  FaSnapchat,
  FaTiktok,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useGetProfileInfoQuery } from "../../../../redux/api/profileInfoApi";
import { formatLastUpdate, getLastUpdateTime } from "../../../../utils/buildInfo";
import { useEffect, useState } from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";
import logo from "../../../../assets/images/logoFooter.png";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [lastUpdate, setLastUpdate] = useState("");

  const { data: profileList } = useGetProfileInfoQuery();
  const profile = Array.isArray(profileList) ? profileList[0] : profileList;
  const filePath = profile?.file_path_url || profile?.filePathUrl;

  const profileUrl = filePath
    ? (filePath.startsWith("http")
      ? filePath
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${filePath}`)
    : "#";

  useEffect(() => {
    // Get last update time and format it
    const updateTime = getLastUpdateTime();
    const locale = i18n.language === "ar" ? "ar-SA" : "en-US";
    const formatted = formatLastUpdate(updateTime, locale);
    setLastUpdate(formatted);
  }, [i18n.language]);

  const socials = [
    { icon: <FaFacebookF />, url: "https://www.facebook.com/Bacuratec?locale=ar_AR" },
    { icon: <FaTwitter />, url: "https://x.com/Bacura_tec?s=21" },
    {
      icon: <FaInstagram />,
      url: "https://www.instagram.com/Bacura_tec?igsh=azFzMDY4aGd6ejZv&utm_source=qr",
    },
    {
      icon: <FaSnapchat />,
      url: "https://www.snapchat.com/@Bacura_tec?invite_id=G6fAPTsA&locale=ar_SA%40calendar%3Dgregorian&share_id=a5POSbAvQj-vUY3rK49XUw&xp_id=1&sid=d6804253db774afcbeae7c8ce1688c21",
    },
    { icon: <FaTiktok />, url: "https://www.tiktok.com/@Bacura_tec" },
    { icon: <FaLinkedinIn />, url: "https://www.linkedin.com/company/Bacura-tec/" },
  ];
  return (
    <footer className="pt-16 pb-8 bg-gray-50 border-t border-primary/20 mt-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo & Vision */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-right gap-6">
            <div className="relative w-48 h-16">
              <OptimizedImage
                src={logo}
                alt="Bacura Logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              باكورة أعمال للتقنية، شريكك الرقمي الموثوق لتحويل الأفكار إلى واقع تقني متقن.
            </p>

            {/* Socials - Desktop */}
            <div className="hidden lg:flex gap-3 mt-2">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Important Links */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <h5 className="font-bold text-gray-800 text-lg relative pb-2 w-fit">
              {t("footer.importantLinks")}
              <span className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-primary rounded-full"></span>
            </h5>
            <ul className="flex flex-col gap-3 text-center lg:text-right w-full">
              <li><Link href="/" className="text-gray-600 hover:text-primary transition-colors text-sm">{t("footer.home")}</Link></li>
              <li><Link href="/about-us" className="text-gray-600 hover:text-primary transition-colors text-sm">{t("footer.about")}</Link></li>
              <li><Link href="/our-services" className="text-gray-600 hover:text-primary transition-colors text-sm">{t("footer.services")}</Link></li>
              <li><Link href="/how-it-work" className="text-gray-600 hover:text-primary transition-colors text-sm">{t("footer.howItWorks")}</Link></li>
              <li><Link href="/faqs" className="text-gray-600 hover:text-primary transition-colors text-sm">{t("footer.faq")}</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Legal */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <h5 className="font-bold text-gray-800 text-lg relative pb-2 w-fit">
              سياسات وشروط
              <span className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-primary rounded-full"></span>
            </h5>
            <ul className="flex flex-col gap-3 text-center lg:text-right w-full">
              <li><Link href="/terms" className="text-gray-600 hover:text-primary transition-colors text-sm">الشروط والأحكام</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors text-sm">سياسة الخصوصية</Link></li>
              <li><Link href="/national-location" className="text-gray-600 hover:text-primary transition-colors text-sm">العنوان الوطني</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <h5 className="font-bold text-gray-800 text-lg relative pb-2 w-fit">
              تواصل معنا
              <span className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-primary rounded-full"></span>
            </h5>
            <div className="flex flex-col gap-4 w-full">
              <a href="https://wa.me/+966547000015" target="_blank" className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-500 rounded-full group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <FaWhatsapp size={20} />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray-500">محادثة فورية</span>
                  <span className="text-sm font-semibold dir-ltr text-gray-800">+966 54 700 0015</span>
                </div>
              </a>

              {filePath && (
                <a
                  href={profileUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-2 p-3 bg-primary/5 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all text-sm font-medium"
                >
                  {t("footer.profile")}
                </a>
              )}
            </div>

            {/* Socials - Mobile */}
            <div className="lg:hidden flex gap-3 mt-4 justify-center w-full">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 pt-8 mt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          {lastUpdate && (
            <p className="text-xs text-gray-400 order-3 md:order-1">
              {t("footer.lastUpdate")}: {lastUpdate}
            </p>
          )}

          <div className="flex flex-col items-center gap-1 order-1 md:order-2">
            <p className="text-sm text-gray-600 font-medium">{t("footer.rights")}</p>
          </div>

          <div className="order-2 md:order-3 text-sm text-gray-500 flex items-center gap-1">
            <span>تم التطوير بواسطة</span>
            <a href="https://bacura.sa" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:text-primary/80 transition-colors">
              الحاضنة الرقمية باكورة التقنية
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
