import React, { useEffect } from "react";
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
    <div className="py-9">
      <title>{t("nav.projects")}</title>
      <meta name="description" content={t("navProvider.myProjects")} />
      <div className="container">
        <div className="">
          <div className="">
            <ProjectsTable stats={projectsStats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
