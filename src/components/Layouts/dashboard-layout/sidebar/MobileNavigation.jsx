import Link from "next/link";
import { usePathname } from "next/navigation";
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
const navLinks = [
  {
    name: "الصفحه الرئيسية",
    href: "/provider",
    icon: homeIcon,
    iconActive: homeIconActive,
  },
  {
    name: "الطلبات المتاحه",
    href: "/provider/active-orders",
    icon: requestOrders,
    iconActive: requestOrdersActive,
  },
  {
    name: "مشاريعي",
    href: "/provider/our-projects",
    icon: projects,
    iconActive: projectsActive,
  },
  {
    name: "تقييماتي",
    href: "/provider/our-rates",
    icon: rates,
    iconActive: ratesActive,
  },
  {
    name: "البلاغات",
    href: "/provider/tickets",
    icon: reports,
    iconActive: reportsActive,
  },
];

const MobileNavigation = () => {
  const pathname = usePathname();
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Navigation Links */}
        <nav className="flex-1 flex justify-around items-center gap-1">
          {navLinks?.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center space-y-1 text-sm text-gray-500 hover:text-primary transition-all ${
                pathname === link?.href
                  ? "text-primary font-semibold"
                  : ""
              }`}
            >
              <img src={link.iconActive} alt={link.name} className="w-6 h-6" />
              {/* <span className="text-xs">{link.name}</span> */}
            </Link>
          ))}
        </nav>

        {/* User & Cart Actions */}
      </div>
    </div>
  );
};

export default MobileNavigation;
