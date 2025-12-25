import React, { useEffect } from "react";
import Hero from "../../../components/landing-components/home-components/hero/Hero";
import Services from "../../../components/landing-components/home-components/services/Services";
import AboutUs from "../../../components/landing-components/home-components/aboutUs/AboutUs";
import HowItWork from "../../../components/landing-components/home-components/howItWork/HowItWork";
import Join from "../../../components/landing-components/home-components/joinNow/Join";
import Faqs from "../../../components/landing-components/home-components/faqs/Faqs";
import { useGetServicesQuery } from "../../../redux/api/servicesApi";
import LoadingPage from "../../LoadingPage";
import Partners from "../../../components/landing-components/home-components/partners/Partners";
import { useTranslation } from "react-i18next";
import Customers from "../../../components/landing-components/home-components/customers/Customers";
import MainLayout from "../../../components/Layouts/main-layout/MainLayout";

const Home = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: services, isLoading } = useGetServicesQuery({});

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <MainLayout>
      <div className="bg-white">
        <title>{t("home.metaTitle")}</title>
        <meta name="description" content={t("about.metaDescription")} />
        <Hero />
        <Services data={services} />
        <AboutUs />
        <HowItWork />
        <Join />
        <Faqs />
        <Partners />
        <Customers />
      </div>
    </MainLayout>
  );
};

export default Home;
