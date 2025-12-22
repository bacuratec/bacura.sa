import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import RequestersTable from "@/components/admin-components/requesters/RequestersTable";
import { useGetRequestersStatisticsQuery } from "../../../redux/api/adminStatisticsApi";
import { useTranslation } from "react-i18next";

const Requesters = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: requesterStats } = useGetRequestersStatisticsQuery();

  return (
    <div>
      <title>{t("requesters.title")}</title>
      <meta name="description" content={t("requesters.description")} />

      <HeadTitle
        title={t("requesters.title")}
        // description={t("requesters.description")}
      />
      <RequestersTable stats={requesterStats} />
    </div>
  );
};

export default Requesters;
