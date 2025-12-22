import { NavLink, useLocation } from "react-router-dom";
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
const navLinks = [
  {
    name: "الصفحه الرئيسية",
    href: "/admin",
    icon: homeIcon,
    iconActive: homeIconActive,
  },
  {
    name: "مزودي الخدمة",
    href: "/admin/providers",
    icon: providers,
    iconActive: providersActive,
  },
  {
    name: "طالبي الخدمة",
    href: "/admin/requesters",
    icon: requester,
    iconActive: requesterActive,
  },
  {
    name: "الطلبات",
    href: "/admin/requests",
    icon: requestOrders,
    iconActive: requestOrdersActive,
  },
  {
    name: "المشاريع",
    href: "/admin/projects",
    icon: projectsManage,
    iconActive: projectsManageActive,
  },
  {
    name: "التقييمات",
    href: "/admin/our-rates",
    icon: rates,
    iconActive: ratesActive,
  },
  {
    name: "الخدمات",
    href: "/admin/services",
    icon: requester,
    iconActive: requesterActive,
  },
  {
    name: "البلاغات",
    href: "/admin/tickets",
    icon: reports,
    iconActive: reportsActive,
  },
  {
    name: "الأسئلة الشائعة",
    href: "/admin/faqs",
    icon: <FileQuestionMark width={15} />,
    iconActive: reportsActive,
    ic: true,
  },
  {
    name: "profile-info",
    href: "/admin/profile-info",
    icon: <File width={15} />,
    iconActive: reportsActive,
    ic: true,
  },
  {
    name: "شركاؤنا",
    href: "/admin/partners",
    icon: providers,
    iconActive: providersActive,
  },
  {
    name: "شركاؤنا",
    href: "/admin/customers",
    icon: providers,
    iconActive: providersActive,
  },
];
const MobileNavigation = () => {
  const path = useLocation();
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Navigation Links */}
        <nav className="flex-1 flex justify-around items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={`flex flex-col items-center justify-center space-y-1 text-sm text-gray-500 hover:text-primary transition-all ${
                path?.pathname === link?.href
                  ? "text-primary font-semibold"
                  : ""
              }`}
            >
              {link?.ic ? (
                link?.icon
              ) : (
                <img
                  src={link.iconActive}
                  alt={link.name}
                  className="w-4 h-4"
                />
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
