import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import RequestsTable from "@/components/admin-components/requests/RequestsTable";
import { useTranslation } from "react-i18next";
import { useGetRequestsStatisticsQuery } from "@/redux/api/adminStatisticsApi";

const Requestes = () => {
  const { t } = useTranslation();
  const { data: requestsStats, isLoading } = useGetRequestsStatisticsQuery();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <title>{t("requests.title")}</title>
      <meta name="description" content={t("requests.description")} />
      <HeadTitle
        title={t("requests.title")}
        // description={t("requests.description")}
      />
      <RequestsTable stats={requestsStats} />
    </div>
  );
};

export default Requestes;
