import logo from "../../../../assets/images/logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";

import homeIcon from "../../../../assets/icons/homeIcon.svg";
import homeIconActive from "../../../../assets/icons/homeIconActive.svg";

import providers from "../../../../assets/icons/providers.svg";
import providersActive from "../../../../assets/icons/providersActive.svg";

import requester from "../../../../assets/icons/requester.svg";
import requesterActive from "../../../../assets/icons/requesterActive.svg";

import requestOrders from "../../../../assets/icons/requestOrders.svg";
import requestOrdersActive from "../../../../assets/icons/requestOrdersActive.svg";

import projectsManage from "../../../../assets/icons/projectsManage.svg";
import projectsManageActive from "../../../../assets/icons/projectsManageActive.svg";

import rates from "../../../../assets/icons/rates.svg";
import ratesActive from "../../../../assets/icons/ratesActive.svg";

import reports from "../../../../assets/icons/reports.svg";
import reportsActive from "../../../../assets/icons/reportsActive.svg";
import { File, FileQuestionMark } from "lucide-react";
import { FaPeopleArrows } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../../../utils/env";
import { useLocation } from "@/utils/useLocation";

const SideBar = ({ data }) => {
  const { t } = useTranslation();
  const Links = [
    {
      name: t("nav.providers"),
      href: "/admin/providers",
      icon: providers,
      iconActive: providersActive,
    },
    {
      name: t("nav.requesters"),
      href: "/admin/requesters",
      icon: requester,
      iconActive: requesterActive,
    },
    {
      name: t("nav.requests"),
      href: "/admin/requests",
      icon: requestOrders,
      iconActive: requestOrdersActive,
    },
    {
      name: t("nav.projects"),
      href: "/admin/projects",
      icon: projectsManage,
      iconActive: projectsManageActive,
    },
    {
      name: t("nav.rates"),
      href: "/admin/our-rates",
      icon: rates,
      iconActive: ratesActive,
    },
    {
      name: t("nav.services"),
      href: "/admin/services",
      icon: requester,
      iconActive: requesterActive,
    },
    {
      name: t("nav.tickets"),
      href: "/admin/tickets",
      icon: reports,
      iconActive: reportsActive,
    },
    {
      name: t("nav.faqs"),
      href: "/admin/faqs",
      icon: <FileQuestionMark />,
      iconActive: reportsActive,
      ic: true,
    },
    {
      name: t("footer.profile"),
      href: "/admin/profile-info",
      icon: <File />,
      iconActive: reportsActive,
      ic: true,
    },
    {
      name: t("nav.partners"),
      href: "/admin/partners",
      icon: providers,
      iconActive: providersActive,
    },
    {
      name: t("nav.customers"),
      href: "/admin/customers",
      icon: providers,
      iconActive: providersActive,
    },
  ];
  const pathname = usePathname();
  const path = useLocation();
  const imageUrl = data?.profilePictureUrl
    ? `${getAppBaseUrl()}/${data.profilePictureUrl}`
    : logo;
  return (
    <aside className="min-h-screen fixed w-[250px] bg-primary top-0 right-0 hidden lg:flex flex-col justify-between">
      <div className="logo px-10 py-3">
        <img src={logo} alt="" />
      </div>
      <nav className="flex-1">
        <ul>
          <li>
            <Link
              href={"/admin"}
              className={`flex items-center gap-6 py-3 px-6 text-white ${
                pathname === "/admin"
                  ? "!text-black font-medium bg-white border-r-4 border-r-black"
                  : ""
              }`}
            >
              <img
                src={pathname === "/admin" ? homeIconActive : homeIcon}
                alt="home"
              />
              <span>{t("navProvider.home")}</span>
            </Link>
          </li>
          {Links.map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                className={`flex items-center gap-6 py-3 px-6 text-white ${
                  pathname.includes(item.href)
                    ? "!text-black font-medium bg-white border-r-4 border-r-black"
                    : ""
                }`}
              >
                {item.ic ? (
                  <span
                    className={
                      pathname.includes(item.href)
                        ? "text-[#1A71F6]"
                        : "text-white"
                    }
                  >
                    {item.icon}
                  </span>
                ) : (
                  <img
                    src={
                      pathname.includes(item.href)
                        ? item.iconActive
                        : item.icon
                    }
                    alt={item.name}
                  />
                )}

                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div
        className="info flex items-center gap-2 px-6 py-7"
        style={{ boxShadow: "0px 1px 0px 0px #F1F1F1 inset" }}
      >
        <div className="rounded-full w-8 h-8 overflow-hidden border-2 border-[#D8D8FE]">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <Link href={"/admin/profile"} className="content text-white">
          <h3 className="font-medium leading-4">{data?.fullName}</h3>
          <span className="text-xs font-normal leading-4">
            {t("nav.admin")}
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default SideBar;
