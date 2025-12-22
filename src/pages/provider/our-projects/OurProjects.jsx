import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ProjectsList from "../../../components/provider-components/our-projects/ProjectsList";
// import { useGetProjectStatisticsQuery } from "../../../redux/api/projectsApi";
import { useGetProviderOrderStatisticsQuery } from "../../../redux/api/adminStatisticsApi";
import { useTranslation } from "react-i18next";

const Projects = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // const { data: projectsStats } = useGetProjectStatisticsQuery();
  const { data: projectsStats } = useGetProviderOrderStatisticsQuery({});

  return (
    <div>
      <title>{t("projects.pageTitle")}</title>
      <meta name="description" content={t("projects.pageDescription")} />
      <HeadTitle
        title={t("projects.pageTitle")}
        // description={t("projects.pageDescription")}
      />
      <ProjectsList stats={projectsStats} />
    </div>
  );
};

export default Projects;
