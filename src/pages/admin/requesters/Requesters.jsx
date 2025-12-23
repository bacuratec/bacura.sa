import React, { useEffect, useState } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import RequestersTable from "@/components/admin-components/requesters/RequestersTable";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

const Requesters = () => {
  const { t } = useTranslation();
  const [requesterStats, setRequesterStats] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from("requesters")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        setRequesterStats({
          totalRequestersCount: count || 0,
          activeRequestersCount: 0,
          inactiveRequestersCount: 0,
        });
      } catch (err) {
        console.error("Error fetching requesters stats:", err);
        setRequesterStats({
          totalRequestersCount: 0,
          activeRequestersCount: 0,
          inactiveRequestersCount: 0,
        });
      }
    };

    fetchStats();
  }, []);

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
