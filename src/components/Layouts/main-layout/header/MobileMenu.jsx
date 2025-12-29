import Link from "next/link";
import logoutIcon from "@/assets/icons/logout.svg";
import NavLinks from "./NavLinks";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="lg:hidden mt-4 space-y-4 overflow-hidden"
        >
          <nav>
            <ul className="flex flex-col gap-4 text-[#2B2D32] text-sm">
              <NavLinks links={links} isActive={isActive} onClick={onClose} />
            </ul>
          </nav>

          {token && role === "Requester" ? (
            <div className="flex flex-col gap-3 pb-4">
              <button
                onClick={onLogout}
                className="logout border border-[#ccc] rounded-lg gap-1 p-2 font-medium text-sm flex justify-between items-center hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <span className="inline">{t("mobileMenu.logout")}</span>
                <img src={logoutIcon} alt="logout" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-4">
              <Link
                href="/signup"
                className="py-2 px-4 bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors"
                onClick={onClose}
              >
                {t("mobileMenu.signup")}
              </Link>
              <Link
                href="/login"
                className="py-2 px-4 border border-primary text-primary rounded-lg text-center hover:bg-primary/5 transition-colors"
                onClick={onClose}
              >
                {t("mobileMenu.login")}
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
