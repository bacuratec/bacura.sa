import { NavLink, useLocation } from "react-router-dom";
import { HomeIcon, PlusCircle, UserCircle2Icon } from "lucide-react";
import { useSelector } from "react-redux";
import requestOrders from "../../../../assets/icons/requestOrders.svg";
import requestOrdersActive from "../../../../assets/icons/requestOrdersActive.svg";
const MobileNavigation = ({ data }) => {
  const { token, role } = useSelector((state) => state.auth);

  const navLinks = [
    {
      name: "الصفحه الرئيسية",
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
  const path = useLocation();
  const imageUrl = data?.profilePictureUrl
    ? `${import.meta.env.VITE_APP_BASE_URL}/${data.profilePictureUrl}`
    : null;
  // <UserCircle2Icon />
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Navigation Links */}
        <nav className="flex-1 flex justify-around items-center gap-1">
          {navLinks?.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={`flex flex-col items-center justify-center space-y-1 text-sm text-gray-500 hover:text-primary transition-all ${
                path?.pathname === link?.href
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
            </NavLink>
          ))}

          {token && imageUrl ? (
            <NavLink
              to="/profile"
              className="flex items-center gap-1 border-2 border-primary/50 rounded-full w-10 h-10 overflow-hidden p-1"
            >
              <img
                src={imageUrl}
                alt="user"
                className="w-full h-full object-cover rounded-full"
              />
            </NavLink>
          ) : (
            <NavLink
              to={"/login"}
              className={`flex flex-col items-center justify-center space-y-1 text-sm text-gray-500 hover:text-primary transition-all ${
                path?.pathname === "/login" ? "text-primary font-semibold" : ""
              }`}
            >
              <UserCircle2Icon />
            </NavLink>
          )}
        </nav>

        {/* User & Cart Actions */}
      </div>
    </div>
  );
};

export default MobileNavigation;
