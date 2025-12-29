import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ProviderTable from "@/components/admin-components/providers/ProvidersTable";
import { useTranslation } from "react-i18next";
import { useGetServiceProvidersStatisticsQuery } from "@/redux/api/adminStatisticsApi";

const Providers = () => {
  const { t } = useTranslation();
  const { data: providerStats, isLoading } = useGetServiceProvidersStatisticsQuery();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
