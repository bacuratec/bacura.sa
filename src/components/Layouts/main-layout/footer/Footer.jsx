"use client";

import logo from "../../../../assets/images/logoFooter.png";
import twitter from "../../../../assets/icons/twitter.svg";
import linked from "../../../../assets/icons/linked.svg";
import insta from "../../../../assets/icons/insta.svg";
import facebook from "../../../../assets/icons/facebook.svg";
import Link from "next/link";
import { useSelector } from "react-redux";
import { FaSnapchat, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useGetProfileInfoQuery } from "../../../../redux/api/profileInfoApi";
import { getAppBaseUrl } from "../../../../utils/env";
import { formatLastUpdate, getLastUpdateTime } from "../../../../utils/buildInfo";
import { useEffect, useState } from "react";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const base = getAppBaseUrl();
  const [lastUpdate, setLastUpdate] = useState("");

  const role = useSelector((state) => state.auth.role);

  const { data } = useGetProfileInfoQuery();

  useEffect(() => {
    // Get last update time and format it
    const updateTime = getLastUpdateTime();
    const locale = i18n.language === "ar" ? "ar-SA" : "en-US";
    const formatted = formatLastUpdate(updateTime, locale);
    setLastUpdate(formatted);
  }, [i18n.language]);

  const socials = [
    { icon: facebook, url: "https://www.facebook.com/Bacuratec?locale=ar_AR" },
    { icon: twitter, url: "https://x.com/Bacura_tec?s=21" },
    {
      icon: insta,
      url: "https://www.instagram.com/Bacura_tec?igsh=azFzMDY4aGd6ejZv&utm_source=qr",
    },
    {
      icon: <FaSnapchat />,
      url: "https://www.snapchat.com/@Bacura_tec?invite_id=G6fAPTsA&locale=ar_SA%40calendar%3Dgregorian&share_id=a5POSbAvQj-vUY3rK49XUw&xp_id=1&sid=d6804253db774afcbeae7c8ce1688c21",
      ic: true,
    },
    { icon: <FaTiktok />, url: "https://www.tiktok.com/@Bacura_tec", ic: true },
    { icon: linked, url: "https://www.linkedin.com/company/Bacura-tec/" },
    { icon: <FaWhatsapp />, url: "https://wa.me/+966547000015", ic: true },
  ];
  return (
    <footer className="pt-10 xl:mt-20 border border-t border-t-primary block mt-5">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 lg:gap-16 xl:gap-20">
          <div className="desc flex flex-col justify-between items-center gap-4 col-span-2 lg:col-span-3 xl:col-span-2">
            <div className="logo w-full h-32">
              <img
                src={logo}
                alt="logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={`${base}${data?.filePathUrl}`}
                target="_blank"
                className="hidden lg:block underline"
              >
                {t("footer.profile")}
              </a>
              <ul className="hidden lg:flex gap-3">
                {socials.map((social, index) => (
                  <li key={index}>
                    <a
                      href={social?.url}
                      target="_blank"
                      className="w-8 h-8 flex items-center justify-center border rounded-full"
                    >
                      {social?.ic ? (
                        social?.icon
                      ) : (
                        <img src={social.icon} alt="Social" />
                      )}
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
            <a
              href={`${base}${data?.filePathUrl}`}
              target="_blank"
              className="underline"
            >
              {t("footer.profile")}
            </a>
            <ul className="lg:hidden flex gap-3 ">
              {socials.map((social, index) => (
                <li key={index}>
                  <a
                    href={social?.url}
                    target="_blank"
                    className="w-6 h-6 flex items-center justify-center border rounded-full"
                  >
                    {social?.ic ? (
                      social?.icon
                    ) : (
                      <img src={social.icon} alt="Social" />
                    )}
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
