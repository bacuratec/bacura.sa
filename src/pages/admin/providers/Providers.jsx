import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ProviderTable from "@/components/admin-components/providers/ProvidersTable";
import { useGetServiceProvidersStatisticsQuery } from "../../../redux/api/adminStatisticsApi";
import { useTranslation } from "react-i18next";

const Providers = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: providerStats } = useGetServiceProvidersStatisticsQuery();

  return (
    <div>
      <title>{t("providers.pageTitle")}</title>
      <meta name="description" content={t("providers.pageDescription")} />
      <HeadTitle
        title={t("providers.pageTitle")}
        // description={t("providers.pageDescription")}
      />
      <ProviderTable stats={providerStats} />
    </div>
  );
};

export default Providers;
