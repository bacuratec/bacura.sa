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
        const { count, error } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        setProjectsStats({
          totalOrdersCount: count || 0,
          inProgressOrdersCount: 0,
          completedOrdersCount: 0,
          cancelledOrdersCount: 0,
        });
      } catch (err) {
        console.error("Error fetching projects stats:", err);
        setProjectsStats({
          totalOrdersCount: 0,
          inProgressOrdersCount: 0,
          completedOrdersCount: 0,
          cancelledOrdersCount: 0,
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
