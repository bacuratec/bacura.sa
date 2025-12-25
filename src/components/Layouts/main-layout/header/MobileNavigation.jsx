/* eslint-disable */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlusCircle, UserCircle2Icon } from "lucide-react";
import { useSelector } from "react-redux";
import requestOrders from "../../../../assets/icons/requestOrders.svg";
import requestOrdersActive from "../../../../assets/icons/requestOrdersActive.svg";
import { getAppBaseUrl } from "../../../../utils/env";

const MobileNavigation = ({ data }) => {
  const { token, role } = useSelector((state) => state.auth);

  const navLinks = [
    {
      name: " الصفحه الرئيسية",
      href: "/",
      icon: <HomeIcon />,
    },
    {
      name: "طلباتي",
      href: "/requests",
      icon: requestOrders,
      iconActive: requestOrdersActive,
      ic: false,
    },
    {
      name: "طلب خدمة",
      href: role === "Requester" ? "/request-service" : "/signup",
      icon: <PlusCircle />,
    },
  ];
  const pathname = usePathname();
  const imageUrl = data?.profilePictureUrl
    ? `${getAppBaseUrl()}/${data.profilePictureUrl}`
    : null;
  // <UserCircle2Icon />
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
              {link?.ic === false ? (
                <img
                  src={link.iconActive}
                  alt={link.name}
                  className="w-6 h-6"
                />
              ) : (
                link?.icon
              )}
            </Link>
          ))}

          {token && imageUrl ? (
            <Link
              href="/profile"
              className="flex items-center gap-1 border-2 border-primary/50 rounded-full w-10 h-10 overflow-hidden p-1"
            >
              <img
                src={imageUrl}
                alt="user"
                className="w-full h-full object-cover rounded-full"
              />
            </Link>
          ) : (
            <Link
              href={"/login"}
              className={`flex flex-col items-center justify-center space-y-1 text-sm text-gray-500 hover:text-primary transition-all ${
                pathname === "/login" ? "text-primary font-semibold" : ""
              }`}
            >
              <UserCircle2Icon />
            </Link>
          )}
        </nav>

        {/* User & Cart Actions */}
      </div>
    </div>
  );
};

export default MobileNavigation;
