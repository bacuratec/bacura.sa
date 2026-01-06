"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
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
import { getAppBaseUrl } from "../../../../utils/env";
import { formatLastUpdate, getLastUpdateTime } from "../../../../utils/buildInfo";
import { useEffect, useState } from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";
import logo from "../../../../assets/images/logoFooter.png";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const base = getAppBaseUrl();
  const [lastUpdate, setLastUpdate] = useState("");

  const role = useSelector((state) => state.auth.role);

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
    { icon: <FaWhatsapp />, url: "https://wa.me/+966547000015" },
  ];
  return (
    <footer className="pt-10 xl:mt-20 border border-t border-t-primary block mt-5">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 lg:gap-16 xl:gap-20">
          <div className="desc flex flex-col justify-between items-center gap-4 col-span-2 lg:col-span-3 xl:col-span-2">
            <div className="logo w-full h-32 relative">
              <OptimizedImage
                src={logo}
                alt="logo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-col gap-3">
              {filePath && (
                <a
                  href={profileUrl}
                  target="_blank"
                  className="hidden lg:block underline text-primary hover:text-primary/80 transition-colors"
                >
                  {t("footer.profile")}
                </a>
              )}
              <ul className="hidden lg:flex gap-3">
                {socials.map((social, index) => (
                  <li key={index}>
                    <a
                      href={social?.url}
                      target="_blank"
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm text-lg"
                    >
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="socials flex flex-col gap-5">
            <h5 className="font-semibold text-sm md:text-base">
              {t("footer.importantLinks")}
            </h5>
            <ul className="flex flex-col gap-3">
              <li className="text-xs md:text-sm">
                <Link href="/">{t("footer.home")}</Link>
              </li>
              <li className="text-xs md:text-sm">
                <Link href="/about-us">{t("footer.about")}</Link>
              </li>
              <li className="text-xs md:text-sm">
                <Link href="/our-services">{t("footer.services")}</Link>
              </li>
              <li className="text-xs md:text-sm">
                <Link href="/how-it-work">{t("footer.howItWorks")}</Link>
              </li>
              <li className="text-xs md:text-sm">
                <Link href="/faqs">{t("footer.faq")}</Link>
              </li>
              {role !== "Requester" && (
                <li className="text-xs md:text-sm">
                  <Link
                    href="/signup-provider"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    {t("footer.joinAsProvider")}
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div className="lg:hidden flex flex-col gap-3 col-span-2">
            {filePath && (
              <a
                href={profileUrl}
                target="_blank"
                className="underline text-primary hover:text-primary/80 transition-colors"
              >
                {t("footer.profile")}
              </a>
            )}
            <ul className="lg:hidden flex gap-3 flex-wrap justify-center">
              {socials.map((social, index) => (
                <li key={index}>
                  <a
                    href={social?.url}
                    target="_blank"
                    className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm text-base"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2 flex-wrap border-t border-t-[#2B2D32] py-5 mt-10">
          <p className="text-center text-xs">{t("footer.rights")}</p>
          {lastUpdate && (
            <p className="text-center text-xs text-gray-500">
              {t("footer.lastUpdate")}: {lastUpdate}
            </p>
          )}
          {/* <ul className="flex items-center gap-7 text-xs">
            <li className="underline">
              <Link to="/">{t("footer.cookies")}</Link>
            </li>
            <li className="underline">
              <Link to="/">{t("footer.terms")}</Link>
            </li>
            <li className="underline">
              <Link to="/">{t("footer.privacy")}</Link>
            </li>
          </ul> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
