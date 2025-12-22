import { useEffect } from "react";
import "./NotFound.css";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Portfolio = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{t("notFound.message")}</p>
      <Link onClick={() => navigate(-1, { replace: true })} to={"#"}>
        {t("notFound.back")}
      </Link>
    </div>
  );
};

export default Portfolio;
