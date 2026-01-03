import React, { useContext, useEffect, useState } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import ProjectListInfo from "../../../components/admin-components/projects/ProjectListInfo";
import { useParams } from "@/utils/useParams";
import { useSearchParams } from "@/utils/useSearchParams";
import {
  useGetProjectDetailsQuery,
  useProviderProjectStateMutation,
} from "../../../redux/api/projectsApi";
import {
  useGetDeliverablesQuery,
  useAddDeliverableMutation,
} from "../../../redux/api/ordersApi";
import { useSelector } from "react-redux";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import ProjectDescription from "../../../components/admin-components/projects/ProjectDescription";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";
import UploadAdminAttachments from "../../../components/shared/forms-end-project/UploadAdminAttachments";
import { FiveHoursTimer } from "./FiveHoursTimer";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import ProjectChat from "@/components/shared/ProjectChat";

const ProviderProjectsDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const userId = useSelector((state) => state?.auth?.userId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { id } = useParams();
  const searchParams = useSearchParams();
  const IsRejected = searchParams.get("IsRejected");
  const IsExpired = searchParams.get("IsExpired");
  const {
    data: projectData,
    isLoading: loadingProject,
    refetch,
  } = useGetProjectDetailsQuery({ id, params: { IsRejected, IsExpired } });

  const { data: deliverablesData, refetch: refetchDeliverables } = useGetDeliverablesQuery({ orderId: id });
  const [addDeliverable] = useAddDeliverableMutation();
  const [newDeliverable, setNewDeliverable] = useState({ title: "", description: "", url: "" });

  const startISO = projectData?.assignTime; // اختار اللي يناسبك

  const [statusId, setStatusId] = useState(null);
  // const orderAttachments = projectData?.orderAttachments || [];

  useEffect(() => {
    setStatusId(projectData?.orderStatus?.id);
  }, [projectData]);
  const [rejected, setRejected] = useState(false);
  const [ProviderProjectState, { isLoading: loadingCreateState }] =
    useProviderProjectStateMutation();

  const handleAction = async (actionType) => {
    try {
      const payload = {
        orderId: id,
        approvalAction: actionType === "approve" ? true : undefined,
        startAction: actionType === "start" ? true : undefined,
        completeServiceAction: actionType === "complete" ? true : undefined,
      };

      if (actionType === "reject") {
        payload.approvalAction = false;
      }

      await ProviderProjectState(payload).unwrap();

      if (actionType === "reject") {
        setRejected(true);
      } else {
        // reload projectData to get latest status from backend
        // eslint-disable-next-line no-unused-vars
        setStatusId((prev) =>
          actionType === "approve" ? 18 : actionType === "start" ? 13 : 15
        );
      }
      refetch();
    } catch (error) {
      console.error("حدث خطأ أثناء تحديث حالة المشروع:", error);
    }
  };

  if (loadingProject) {
    return <LoadingPage />;
  }

  if (!projectData) {
    return <NotFound />;
  }
  return (
    <div className="py-10 bg-gray-50/50 min-h-screen">
      <title>
        {t("providerProjectsDetails.projectDetails", {
          number: projectData?.orderNumber,
        })}
      </title>
      <div className="container px-4 mx-auto max-w-7xl animate-fade-in">
        <div className="mb-8 p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-premium overflow-hidden relative group">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-secondary/10 transition-colors duration-700" />

          <div className="relative z-10">
            <HeadTitle
              title={t("providerProjectsDetails.projectDetails", {
                number: projectData?.orderNumber,
              })}
              nav1={t("providerProjectsDetails.projectNav1")}
              nav2={t("providerProjectsDetails.projectNav2")}
              typeProject={
                lang === "ar"
                  ? projectData?.orderStatus?.nameAr
                  : projectData?.orderStatus?.nameEn
              }
              statusProject={projectData?.orderStatus?.id}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-8">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            <div className="glass-card p-1 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <div className="bg-white rounded-[2.2rem] overflow-hidden">
                <ProjectListInfo data={projectData} />
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                </div>
                {t("providerProjectsDetails.description") || "الوصف"}
              </h3>
              <ProjectDescription des={projectData?.description} />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8">
            {/* Action Buttons Box */}
            <div className="glass-card p-8 rounded-[2.5rem] border-2 border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h3 className="text-lg font-bold mb-6 shimmer-text inline-block">{t("providerProjectsDetails.actions") || "الإجراءات"}</h3>

              <div className="flex flex-wrap items-center gap-4 relative z-10">
                {statusId === 17 && !rejected && (
                  <>
                    <div className="w-full mb-2">
                      <FiveHoursTimer startISO={startISO} durationHours={5} />
                    </div>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={loadingCreateState}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    >
                      {t("providerProjectsDetails.reject")}
                    </button>
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={loadingCreateState}
                      className="flex-1 premium-gradient-primary text-white shadow-lg py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-blue-500/25"
                    >
                      {t("providerProjectsDetails.approve")}
                    </button>
                  </>
                )}

                {rejected && (
                  <div className="w-full text-center p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold animate-pulse">
                    {t("providerProjectsDetails.rejectedStatus")}
                  </div>
                )}

                {statusId === 18 && (
                  <button
                    onClick={() => handleAction("start")}
                    disabled={loadingCreateState}
                    className="w-full premium-gradient-warning text-white shadow-lg py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-yellow-500/25"
                  >
                    {t("providerProjectsDetails.start")}
                  </button>
                )}

                {statusId === 13 && (
                  <button
                    onClick={() => handleAction("complete")}
                    disabled={loadingCreateState}
                    className="w-full premium-gradient-success text-white shadow-lg py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-green-500/25 text-lg"
                  >
                    {t("providerProjectsDetails.complete")}
                  </button>
                )}
              </div>
            </div>

            {/* Deliverables Box */}
            <div className="glass-card p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl border border-white/50">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                {t("providerProjectsDetails.deliverables") || "التسليمات"}
              </h3>

              <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {(deliverablesData || []).length === 0 ? (
                  <div className="py-10 text-center text-gray-400 font-medium italic">
                    {t("providerProjectsDetails.noDeliverables") || "لا يوجد تسليمات حالياً"}
                  </div>
                ) : (
                  (deliverablesData || []).map((d) => (
                    <div key={d.id} className="p-4 rounded-2xl bg-white/50 border border-gray-100 hover:border-primary/20 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800">{d.title}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${d.status === 'accepted' ? 'bg-green-100 text-green-600' :
                          d.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                          {d.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3 leading-relaxed">{d.description}</div>
                      {d.delivery_file_url && (
                        <a
                          className="inline-flex items-center gap-2 text-[11px] font-bold text-primary hover:underline"
                          href={d.delivery_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          {t("providerProjectsDetails.download") || "تحميل الملف المصاحب"}
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add New Deliverable */}
              <div className="mt-8 space-y-4 pt-6 border-t border-gray-100/50">
                <div className="relative group">
                  <input
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 transition-all duration-300 shadow-sm group-hover:shadow-md"
                    value={newDeliverable.title}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                    placeholder={t("providerProjectsDetails.deliverableTitle") || "عنوان التسليم (مثال: المسودة الأولى)"}
                  />
                </div>
                <textarea
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 transition-all duration-300 shadow-sm group-hover:shadow-md min-h-[100px]"
                  value={newDeliverable.description}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                  placeholder={t("providerProjectsDetails.deliverableDesc") || "وصف موجز لما تم إنجازه..."}
                />
                <input
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 transition-all duration-300 shadow-sm group-hover:shadow-md"
                  value={newDeliverable.url}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, url: e.target.value })}
                  placeholder={t("providerProjectsDetails.deliverableUrl") || "رابط الملف (Google Drive, Dropbox, etc.)"}
                />
                <button
                  className="w-full premium-gradient-primary text-white py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-primary/30 disabled:opacity-50"
                  disabled={!newDeliverable.title.trim()}
                  onClick={async () => {
                    if (!newDeliverable.title.trim()) return;
                    await addDeliverable({
                      orderId: id,
                      providerId: projectData?.provider?.id,
                      title: newDeliverable.title,
                      description: newDeliverable.description,
                      deliveryFileUrl: newDeliverable.url,
                    }).unwrap();
                    setNewDeliverable({ title: "", description: "", url: "" });
                    refetchDeliverables();
                  }}
                >
                  {t("providerProjectsDetails.addDeliverable") || "تأكيد وإضافة التسليم"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        {projectData?.orderAttachments?.length > 0 && (
          <div className="mt-12 glass-card p-0 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <AttachmentsTable
              title={t("providerProjectsDetails.attachmentsTitle")}
              attachments={projectData?.orderAttachments}
            />
          </div>
        )}

        {/* Chat Section */}
        <div className="mt-12 mb-20 glass-card p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl">
          <ProjectChat
            orderId={id}
            userId={userId}
            title={t("providerProjectsDetails.messages") || "المحادثة الفنية"}
          />
        </div>

        <div className="mt-12">
          <UploadAdminAttachments projectData={projectData} refetch={refetch} />
        </div>
      </div>
    </div>
  );
};

export default ProviderProjectsDetails;
