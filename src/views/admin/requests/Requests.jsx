import React, { useEffect, useState } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import RequestsTable from "@/components/admin-components/requests/RequestsTable";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

const Requestes = () => {
  const { t } = useTranslation();
  const [requestsStats, setRequestsStats] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from("requests")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        setRequestsStats({
          totalRequests: count || 0,
          totalRequestsRequesters: 0,
          projectsDiagnosisRequests: 0,
          consultationsRequests: 0,
          maintenanceContractsRequests: 0,
          trainingRequests: 0,
          projectsSupervisionRequests: 0,
          executionContractsRequests: 0,
          projectsManagementRequests: 0,
          wholesaleSupplyRequests: 0,
        });
      } catch (err) {
        console.error("Error fetching requests stats:", err);
        setRequestsStats({
          totalRequests: 0,
          totalRequestsRequesters: 0,
          projectsDiagnosisRequests: 0,
          consultationsRequests: 0,
          maintenanceContractsRequests: 0,
          trainingRequests: 0,
          projectsSupervisionRequests: 0,
          executionContractsRequests: 0,
          projectsManagementRequests: 0,
          wholesaleSupplyRequests: 0,
        });
      }
    };

    fetchStats();
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
