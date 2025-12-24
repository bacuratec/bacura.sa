import React, { useContext, useEffect, useState } from "react";
import HeadTitle from "@/components/admin-components/users-details/HeadTitle";
import ProjectListInfo from "@/components/admin-components/projects/ProjectListInfo";
import { useParams } from "react-router-dom";
import { useGetProjectDetailsQuery } from "@/redux/api/projectsApi";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import ProjectDescription from "@/components/admin-components/projects/ProjectDescription";
import AttachmentsTable from "@/components/admin-components/projects/AttachmentsTable";
import UploadAdminAttachments from "../../../components/shared/forms-end-project/UploadAdminAttachments";
import { useSelector } from "react-redux";
import AddReviewModal from "../../../components/landing-components/add-rate/AddRateModal";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";

const ProjectUserDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const role = useSelector((state) => state.auth.role);
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { id } = useParams();
  const {
    data: projectData,
    isLoading: loadingProject,
    refetch,
  } = useGetProjectDetailsQuery({ id });

  if (loadingProject) {
    return <LoadingPage />;
  }

  if (!projectData) {
    return <NotFound />;
  }
  return (
    <div className="py-6">
      <title>{`${t("projectDetails.title")} #${
        projectData?.orderNumber
      }`}</title>
      <meta name="description" content={projectData?.description} />
      <div className="container">
        <HeadTitle
          title={`${t("projectDetails.title")} #${projectData?.orderNumber}`}
          nav1={t("projectDetails.nav1")}
          nav2={t("projectDetails.nav2")}
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
        {/* <AttachmentsTable
          title={"المرفقات الخاصة بالمشروع"}
          attachments={projectData?.orderAttachments}
        /> */}
        <AttachmentsTable
          title={t("projectDetails.projectAttachments")}
          attachments={projectData?.orderAttachments?.filter(
            (att) => att.attachmentUploaderLookupId !== 700
          )}
        />
        <AttachmentsTable
          title={t("projectDetails.requesterAttachments")}
          attachments={projectData?.requestAttachments}
        />
        <UploadAdminAttachments projectData={projectData} refetch={refetch} />

        {role === "Requester" &&
          !projectData?.isRated &&
          projectData?.orderStatus?.id === 603 && (
            <button
              onClick={() => {
                setOrderId(projectData.id);
                setOpen(true);
              }}
              className="bg-green-600 text-white px-10 py-4 rounded-lg hover:bg-green-700 transition text-base font-bold mx-auto block"
            >
              {t("projectDetails.addReview")}
            </button>
          )}
        <AddReviewModal
          open={open}
          setOpen={setOpen}
          orderId={orderId}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default ProjectUserDetails;
