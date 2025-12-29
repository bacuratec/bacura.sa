import logo from "../../../../assets/images/logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetProviderOrderStatisticsQuery } from "@/redux/api/adminStatisticsApi";

import homeIcon from "../../../../assets/icons/homeIcon.svg";
import homeIconActive from "../../../../assets/icons/homeIconActive.svg";

import requestOrders from "../../../../assets/icons/requestOrders.svg";
import requestOrdersActive from "../../../../assets/icons/requestOrdersActive.svg";

import projects from "../../../../assets/icons/projects.svg";
import projectsActive from "../../../../assets/icons/projectsActive.svg";

import rates from "../../../../assets/icons/rates.svg";
import ratesActive from "../../../../assets/icons/ratesActive.svg";

import reports from "../../../../assets/icons/reports.svg";
import reportsActive from "../../../../assets/icons/reportsActive.svg";
import { getAppBaseUrl } from "../../../../utils/env";

const SideBar = ({ data }) => {
  const { t } = useTranslation();
  const imageUrl = data?.profilePictureUrl
    ? `${getAppBaseUrl()}/${data.profilePictureUrl}`
    : logo;

  const Links = [
    {
      name: t("navProvider.availableOrders"),
      href: "/provider/active-orders",
      icon: requestOrders,
      iconActive: requestOrdersActive,
    },
    {
      name: t("navProvider.myProjects"),
      href: "/provider/our-projects",
      icon: projects,
      iconActive: projectsActive,
    },
    {
      name: t("navProvider.myRatings"),
      href: "/provider/our-rates",
      icon: rates,
      iconActive: ratesActive,
    },
    {
      name: t("navProvider.reports"),
      href: "/provider/tickets",
      icon: reports,
      iconActive: reportsActive,
    },
  ];

  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const userId = useSelector((state) => state.auth.userId);
  const { data: providerStats } = useGetProviderOrderStatisticsQuery({ providerId: userId }, { skip: !userId });
  return (
    <aside className={`min-h-screen fixed ${collapsed ? "w-[80px]" : "w-[250px]"} bg-white border-l lg:border-r border-gray-200 top-0 right-0 hidden lg:flex flex-col justify-between`}>
      <div className="logo px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <img src={logo} alt="" className={collapsed ? "h-8 w-8 object-contain" : "h-10 w-auto object-contain"} />
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-md p-2 hover:bg-gray-100 text-gray-700"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      <nav className="flex-1">
        <ul>
          <li>
            <Link
              href={"/provider"}
              aria-current={pathname === "/provider" ? "page" : undefined}
              className={`group flex items-center gap-4 py-3 px-6 text-gray-700 ${
                pathname === "/provider"
                  ? "text-primary font-medium bg-gray-100 border-r-4 border-r-primary"
                  : "hover:text-primary"
              }`}
            >
              <img
                src={pathname === "/provider" ? homeIconActive : homeIcon}
                alt="home"
                className="w-6 h-6"
              />
              {!collapsed && <span className="truncate">{t("navProvider.home")}</span>}
              {pathname === "/provider" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          </li>
          {Links.map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                aria-current={pathname.includes(item.href) ? "page" : undefined}
                className={`group flex items-center gap-4 py-3 px-6 text-gray-700 ${
                  pathname.includes(item.href)
                    ? "text-primary font-medium bg-gray-100 border-r-4 border-r-primary"
                    : "hover:text-primary"
                }`}
              >
                <img
                  src={
                    pathname.includes(item.href)
                      ? item.iconActive
                      : item.icon
                  }
                  alt={item.name}
                  className="w-6 h-6"
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
                {!collapsed && item.href === "/provider/our-projects" && typeof providerStats?.totalOrders === "number" && (
                  <span className="ml-auto text-xs rounded-lg px-2 py-0.5 bg-primary/10 text-primary">
                    {providerStats.totalOrders}
                  </span>
                )}
                {pathname.includes(item.href) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="info flex items-center gap-2 px-6 py-7 border-t border-gray-200">
        <div className="rounded-full w-8 h-8 overflow-hidden border-2 border-[#D8D8FE]">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <Link href={"/provider/profile"} className="content text-gray-700">
            <h3 className="font-medium leading-4 truncate">{data?.name}</h3>
            <span className="text-xs font-normal leading-4">
              {t("navProvider.serviceProvider")}
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
