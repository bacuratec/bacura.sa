import { Link } from "react-router-dom";
import logoutIcon from "@/assets/icons/logout.svg";
import NavLinks from "./NavLinks";
import { useTranslation } from "react-i18next";

const MobileMenu = ({
  isOpen,
  links,
  isActive,
  token,
  role,
  // imageUrl,
  onLogout,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="lg:hidden mt-4 space-y-4 animate-fade-in">
      <nav>
        <ul className="flex flex-col gap-4 text-[#2B2D32] text-sm">
          <NavLinks links={links} isActive={isActive} onClick={onClose} />
        </ul>
      </nav>

      {token && role === "Requester" ? (
        <div className="flex flex-col gap-3">
          {/* <Link
            to="/request-service"
            className="py-2 px-4 bg-primary text-white rounded-lg text-center"
            onClick={onClose}
          >
            {t("mobileMenu.requestService")}
          </Link> */}
          {/* <Link
            to="/profile"
            className="flex items-center gap-2 mt-2"
            onClick={onClose}
          >
            <div className="w-10 h-10 overflow-hidden rounded-xl">
              <img
                src={imageUrl}
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm">{t("mobileMenu.myProfile")}</span>
          </Link> */}
          <button
            onClick={onLogout}
            className="logout border border-[#ccc] rounded-lg gap-1 p-2 font-medium text-sm flex justify-between items-center"
          >
            <span className="inline">{t("mobileMenu.logout")}</span>
            <img src={logoutIcon} alt="logout" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Link
            to="/signup"
            className="py-2 px-4 bg-primary text-white rounded-lg text-center"
            onClick={onClose}
          >
            {t("mobileMenu.signup")}
          </Link>
          <Link
            to="/login"
            className="py-2 px-4 border border-primary text-primary rounded-lg text-center"
            onClick={onClose}
          >
            {t("mobileMenu.login")}
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
