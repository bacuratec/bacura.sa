// components/Header/NavLinks.jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NavLinks = ({ links, isActive, onClick }) => {
  const { t } = useTranslation();
  return (
    <>
      <li>
        <Link
          to="/"
          onClick={onClick}
          className={`transition-all duration-300 ${
            isActive("/") ? "text-primary font-bold" : "hover:text-primary"
          }`}
        >
          {t("nav.home")}
        </Link>
      </li>
      {links.map(({ name, href }, i) => (
        <li key={i}>
          <Link
            to={href}
            onClick={onClick}
            className={`transition-all duration-300 ${
              isActive(href) ? "text-primary font-bold" : "hover:text-primary"
            }`}
          >
            {name}
          </Link>
        </li>
      ))}
    </>
  );
};

export default NavLinks;
