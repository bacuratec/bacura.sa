import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ProjectsTable from "../../../components/admin-components/projects/ProjectsTable";
import { useGetProjectStatisticsQuery } from "../../../redux/api/projectsApi";
import { useTranslation } from "react-i18next";

const Projects = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: projectsStats } = useGetProjectStatisticsQuery({});

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
