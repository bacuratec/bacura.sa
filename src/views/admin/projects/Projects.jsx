import React, { useEffect, useState } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ProjectsTable from "../../../components/admin-components/projects/ProjectsTable";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

const Projects = () => {
  const { t } = useTranslation();
  const [projectsStats, setProjectsStats] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          total,
          waitingApproval,
          waitingStart,
          processing,
          completed,
          rejected,
          expired
        ] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 17),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 18),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 13),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 15),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 19),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 20),
        ]);

        setProjectsStats({
          totalOrdersCount: total.count || 0,
          waitingForApprovalOrdersCount: waitingApproval.count || 0,
          waitingToStartOrdersCount: waitingStart.count || 0,
          ongoingOrdersCount: processing.count || 0,
          completedOrdersCount: completed.count || 0,
          serviceCompletedOrdersCount: completed.count || 0, // Mapping 'Ended' to 'Completed' for now
          rejectedOrdersCount: rejected.count || 0,
          expiredOrdersCount: expired.count || 0,
        });
      } catch (err) {
        console.error("Error fetching projects stats:", err);
        setProjectsStats({
          totalOrdersCount: 0,
          waitingForApprovalOrdersCount: 0,
          waitingToStartOrdersCount: 0,
          ongoingOrdersCount: 0,
          completedOrdersCount: 0,
          serviceCompletedOrdersCount: 0,
          rejectedOrdersCount: 0,
          expiredOrdersCount: 0,
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <title>{t("projects.pageTitle")}</title>
      <meta name="description" content={t("projects.pageDescription")} />
      <HeadTitle
        title={t("projects.pageTitle")}
        // description={t("projects.pageDescription")}
      />
      <ProjectsTable stats={projectsStats} />
    </div>
  );
};

export default Projects;
