import { useEffect } from "react";
import "./NotFound.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{t("notFound.message")}</p>
      <button onClick={() => navigate(-1)}>
        {t("notFound.back")}
      </button>
    </div>
  );
};

export default NotFound;
