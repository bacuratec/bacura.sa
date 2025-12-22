import React, { useEffect } from "react";
import ExploreRequests from "../../../components/landing-components/ExploreRequests/ExploreRequests";
import { useGetRequestsStatisticsQuery } from "../../../redux/api/adminStatisticsApi";
import { useTranslation } from "react-i18next";

const Explore = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: requestsStats } = useGetRequestsStatisticsQuery();

  return (
    <div className="py-9">
      <title>{t("explore.metaTitle")}</title>
      <meta name="description" content={t("explore.metaDescription")} />
      <div className="container">
        <div className="grid grid-cols-2">
          <div className="col-span-2">
            <ExploreRequests stats={requestsStats} />
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
