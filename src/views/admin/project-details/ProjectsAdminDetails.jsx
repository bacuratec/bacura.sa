import React, { useContext, useEffect } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import ProjectListInfo from "../../../components/admin-components/projects/ProjectListInfo";
import { useParams } from "react-router-dom";
import { useGetProjectDetailsQuery } from "../../../redux/api/projectsApi";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import ProjectDescription from "../../../components/admin-components/projects/ProjectDescription";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";
import UploadAdminAttachments from "../../../components/shared/forms-end-project/UploadAdminAttachments";
import ReassignRequest from "../../../components/admin-components/projects/ReassignRequest";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";

const ProjectsAdminDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();
  const {
    data: projectData,
    isLoading: loadingProject,
    refetch,
  } = useGetProjectDetailsQuery({ id });

  if (loadingProject) return <LoadingPage />;
  if (!projectData) return <NotFound />;

  return (
    <div className="py-10">
      <title>
        {`${t("projects.projectDetailsTitle")} #${projectData?.orderNumber}`}
      </title>
      <meta name="description" content={projectData?.description} />
      <div className="container">
        <HeadTitle
          title={`${t("projects.projectDetailsTitle")} #${
            projectData?.orderNumber
          }`}
          nav1={t("projects.projectManagement")}
          nav2={t("projects.projectDetails")}
          typeProject={
            lang === "ar"
              ? projectData?.orderStatus?.nameAr
              : projectData?.orderStatus?.nameEn
          }
          statusProject={projectData?.orderStatus?.id}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6 xl:gap-8 mt-5">
          <div className="lg:basis-1/2 w-full bg-white shadow-lg overflow-hidden rounded-xl">
            <ProjectListInfo data={projectData} />
          </div>
          <div className="lg:basis-1/2 w-full bg-white shadow-lg overflow-hidden rounded-xl p-5">
            <ProjectDescription des={projectData?.description} />
          </div>
        </div>

        <AttachmentsTable
          title={t("projects.projectAttachments")}
          attachments={projectData?.orderAttachments}
        />
        <AttachmentsTable
          title={t("projects.requesterAttachments")}
          attachments={projectData?.requestAttachments}
        />
        <UploadAdminAttachments projectData={projectData} refetch={refetch} />
        {(projectData?.orderStatus?.id === 605 ||
          projectData?.orderStatus?.id === 604) && (
          <ReassignRequest refetch={refetch} />
        )}
      </div>
    </div>
  );
};

export default ProjectsAdminDetails;
