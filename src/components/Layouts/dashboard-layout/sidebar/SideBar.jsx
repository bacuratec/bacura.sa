import logo from "../../../../assets/images/logo.png";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

  const path = useLocation();

  return (
    <aside className="min-h-screen fixed w-[250px] bg-primary top-0 right-0 hidden lg:flex flex-col justify-between">
      <div className="logo px-10 py-3">
        <img src={logo} alt="" />
      </div>
      <nav className="flex-1">
        <ul>
          <li>
            <NavLink
              to={"/provider"}
              className={`flex items-center gap-6 py-3 px-6 text-white ${
                path?.pathname === "/provider"
                  ? "!text-black font-medium bg-white border-r-4 border-r-black"
                  : ""
              }`}
            >
              <img
                src={path?.pathname === "/provider" ? homeIconActive : homeIcon}
                alt="home"
              />
              <span>{t("navProvider.home")}</span>
            </NavLink>
          </li>
          {Links.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.href}
                className={`flex items-center gap-6 py-3 px-6 text-white ${
                  path?.pathname.includes(item.href)
                    ? "!text-black font-medium bg-white border-r-4 border-r-black"
                    : ""
                }`}
              >
                <img
                  src={
                    path?.pathname.includes(item.href)
                      ? item.iconActive
                      : item.icon
                  }
                  alt={item.name}
                />
                <span>{item.name}</span>
              </NavLink>
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
        <Link to={"/provider/profile"} className="content text-white">
          <h3 className="font-medium leading-4">{data?.name}</h3>
          <span className="text-xs font-normal leading-4">
            {t("navProvider.serviceProvider")}
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default SideBar;
