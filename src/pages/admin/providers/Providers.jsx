import React, { useEffect, useState } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ProviderTable from "@/components/admin-components/providers/ProvidersTable";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

const Providers = () => {
  const { t } = useTranslation();
  const [providerStats, setProviderStats] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from("providers")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        setProviderStats({
          totalProvidersCount: count || 0,
          activeProvidersCount: 0,
          inactiveProvidersCount: 0,
        });
      } catch (err) {
        console.error("Error fetching providers stats:", err);
        setProviderStats({
          totalProvidersCount: 0,
          activeProvidersCount: 0,
          inactiveProvidersCount: 0,
        });
      }
    };

    fetchStats();
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
