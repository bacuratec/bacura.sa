import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../../../../assets/images/logo-landing.png";
import userImg from "../../../../assets/images/user.jpg";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../../redux/slices/authSlice";
import logoutIcon from "@/assets/icons/logout.svg";
import { useGetNotificationsQuery } from "../../../../redux/api/notificationsApi";
import NotificationsModal from "../../NotificationsModal";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import NotificationButton from "./NotificationButton";
import LanguageDropdown from "../../LanguageDropdown";
import { useTranslation } from "react-i18next";

const Header = ({ data }) => {
  const { t } = useTranslation(); // 👈 استخدام hook الترجمة

  const location = useLocation(); // 👈 نجيب اللينك الحالي
  const navigate = useNavigate();
  const { token, role } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const links = [
    { name: t("headerLanding.about"), href: "/about-us" },
    { name: t("headerLanding.services"), href: "/our-services" },
    { name: t("headerLanding.faq"), href: "/faqs" },
    { name: t("headerLanding.support"), href: "/tickets" },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000, // كل 60 ثانية
    skip: !token,
  });
  const unseenNotifications =
    notificationsData?.filter((notification) => notification.seen === false) ||
    [];
  const dispatch = useDispatch();
  const imageUrl = data?.profilePictureUrl
    ? `${process.env.NEXT_PUBLIC_APP_BASE_URL || process.env.VITE_APP_BASE_URL || ""}/${data.profilePictureUrl}`
    : userImg;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="py-3 border-b border-b-[#DBDBDB] sticky top-0 left-0 bg-white z-[500] shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => scrollToTop()}
            className="logo w-[76px] h-[51px]"
          >
            <img src={logo} alt="logo" className="w-full h-full" />
          </Link>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="lg:hidden">
              <LanguageDropdown />
            </div>
            <div className="block lg:hidden">
              {token && role === "Requester" && (
                <>
                  <NotificationButton
                    unseenCount={unseenNotifications.length}
                    setOpen={setIsModalOpen}
                  />

                  <NotificationsModal
                    open={isModalOpen}
                    setOpen={setIsModalOpen}
                  />
                </>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-2xl text-primary"
              >
                {isMenuOpen ? <FiX /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-1">
            <ul className="flex items-center gap-6 text-[#2B2D32] mx-5">
              <NavLinks
                links={links}
                isActive={isActive}
                onClick={() => scrollToTop()}
              />
            </ul>
            <LanguageDropdown />
          </nav>

          {/* Desktop Buttons */}
          {token && role === "Requester" ? (
            <div className="hidden lg:flex items-center gap-4">
              <NotificationButton
                unseenCount={unseenNotifications.length}
                setOpen={setIsModalOpen}
              />
              <NotificationsModal open={isModalOpen} setOpen={setIsModalOpen} />

              <Link
                to="/profile"
                className="flex items-center gap-1 border-2 border-primary/50 rounded-full w-10 h-10 overflow-hidden p-1"
              >
                <img
                  src={imageUrl}
                  alt="user"
                  className="w-full h-full object-cover rounded-full"
                />
              </Link>
              <Link
                to="/request-service"
                className="py-2 px-6 bg-primary text-white rounded-lg"
              >
                {t("headerLanding.requestService")}
              </Link>
              <button
                onClick={async () => {
                  await dispatch(logoutUser());
                  navigate("/login", { replace: true });
                }}
                className="logout border border-[#ccc] rounded-lg flex items-center gap-1 p-2 font-medium text-sm"
              >
                <span className="hidden sm:inline">
                  {t("headerLanding.logout")}
                </span>
                <img src={logoutIcon} alt="" />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/signup"
                className="py-2 px-6 bg-primary text-white rounded-lg"
              >
                {t("headerLanding.signup")}
              </Link>
              <Link
                to="/login"
                className="py-2 px-6 border border-primary text-primary rounded-lg"
              >
                {t("headerLanding.login")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMenuOpen}
          links={links}
          isActive={isActive}
          token={token}
          role={role}
          unseenCount={unseenNotifications.length}
          imageUrl={imageUrl}
          onLogout={async () => {
            await dispatch(logoutUser());
            navigate("/login", { replace: true });
          }}
          onClose={() => setIsMenuOpen(false)}
        />
      </div>
    </header>
  );
};

export default Header;
