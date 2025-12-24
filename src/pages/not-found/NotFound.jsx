import { useEffect } from "react";
import "./NotFound.css";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const Portfolio = () => {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{t("notFound.message")}</p>
      <button onClick={() => router.back()}>
        {t("notFound.back")}
      </button>
    </div>
  );
};

export default Portfolio;
