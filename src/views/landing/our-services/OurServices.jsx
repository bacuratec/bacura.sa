import React, { useEffect } from "react";
import { useGetServicesQuery } from "../../../redux/api/servicesApi";
import LoadingPage from "../../LoadingPage";
import Services from "../../../components/landing-components/home-components/our-services/OurServices";
import { useTranslation } from "react-i18next";

const OurServices = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: services, isLoading } = useGetServicesQuery({});

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <div>
      <title>{t("services.title")}</title>
      <meta name="description" content={t("services.description")} />
      <Services data={services} />
    </div>
  );
};

export default OurServices;
