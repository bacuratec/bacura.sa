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
  useGetProjectMessagesQuery,
  useAddProjectMessageMutation,
} from "../../../redux/api/ordersApi";
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
  const { data: messagesData, refetch: refetchMessages } = useGetProjectMessagesQuery({ orderId: id, PageNumber: 1, PageSize: 50 });
  const [addMessage] = useAddProjectMessageMutation();
  const { data: deliverablesData, refetch: refetchDeliverables } = useGetDeliverablesQuery({ orderId: id });
  const [addDeliverable] = useAddDeliverableMutation();
  const [newMessage, setNewMessage] = useState("");
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
          actionType === "approve" ? 601 : actionType === "start" ? 602 : 603
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
    <div className="py-10">
      <title>
        {t("providerProjectsDetails.projectDetails", {
          number: projectData?.orderNumber,
        })}
      </title>
      <div className="container">
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
          } // ترجم لو عندك nameEn
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
        {projectData?.orderAttachments?.length > 0 && (
          <AttachmentsTable
            title={t("providerProjectsDetails.attachmentsTitle")}
            attachments={projectData?.orderAttachments}
          />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold mb-3">{t("providerProjectsDetails.messages") || "الرسائل"}</h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {(messagesData || []).map((m) => (
                <div key={m.id} className="text-xs border-b pb-2">
                  <div className="font-semibold">{m.sender?.full_name || m.sender?.name || m.sender_id}</div>
                  <div>{m.message}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                className="input flex-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t("providerProjectsDetails.writeMessage") || "اكتب رسالة"}
              />
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!newMessage.trim()) return;
                  await addMessage({ orderId: id, senderId: userId, message: newMessage }).unwrap();
                  setNewMessage("");
                  refetchMessages();
                }}
              >
                {t("common.send") || "إرسال"}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold mb-3">{t("providerProjectsDetails.deliverables") || "التسليمات"}</h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {(deliverablesData || []).map((d) => (
                <div key={d.id} className="text-xs border-b pb-2">
                  <div className="font-semibold">{d.title}</div>
                  <div className="text-gray-600">{d.description}</div>
                  {d.delivery_file_url && (
                    <a className="text-primary underline" href={d.delivery_file_url} target="_blank" rel="noopener noreferrer">
                      {t("providerProjectsDetails.download") || "تحميل"}
                    </a>
                  )}
                  <div className="mt-1">{t("providerProjectsDetails.status") || "الحالة"}: {d.status}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <input
                className="input"
                value={newDeliverable.title}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                placeholder={t("providerProjectsDetails.deliverableTitle") || "عنوان التسليم"}
              />
              <input
                className="input"
                value={newDeliverable.description}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                placeholder={t("providerProjectsDetails.deliverableDesc") || "وصف"}
              />
              <input
                className="input"
                value={newDeliverable.url}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, url: e.target.value })}
                placeholder={t("providerProjectsDetails.deliverableUrl") || "رابط ملف"}
              />
              <div className="flex justify-end">
                <button
                  className="btn btn-primary"
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
                  {t("providerProjectsDetails.addDeliverable") || "إضافة تسليم"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* <AttachmentsTable
          title={"المرفقات الخاصة بطالب الخدمة"}
          attachments={projectData?.requestAttachments}
        /> */}
        {/* اذرار اكشن البروفايدر */}
        {/* أزرار الحالة بناءً على statusId */}
        <div className="flex items-center justify-center md:justify-md:justify-start gap-2 md:gap-3 mb-10 mt-10">
          {statusId === 600 && !rejected && (
            <>
              <FiveHoursTimer
                startISO={startISO}
                durationHours={5}
                // timeZone="Africa/Cairo" // لو عايز تجبر العرض على القاهرة
              />
              {/* زر الرفض */}
              <button
                onClick={() => handleAction("reject")}
                disabled={loadingCreateState}
                className="bg-[#F61A1E] transition-all duration-300 hover:bg-[#F61A1E]/80 py-2 px-4 rounded-xl text-white font-medium text-xs md:text-sm"
              >
                {t("providerProjectsDetails.reject")}
              </button>

              {/* زر القبول */}
              <button
                onClick={() => handleAction("approve")}
                disabled={loadingCreateState}
                className="bg-primary transition-all duration-300 hover:bg-primary/80 py-2 px-4 rounded-xl text-white font-medium text-xs md:text-sm"
              >
                {t("providerProjectsDetails.approve")}
              </button>
            </>
          )}

          {rejected && (
            <span className="border border-[#F61A1E] text-[#F61A1E] px-4 py-2 rounded-xl text-sm font-semibold">
              {t("providerProjectsDetails.rejectedStatus")}
            </span>
          )}

          {statusId === 601 && (
            <button
              onClick={() => handleAction("start")}
              disabled={loadingCreateState}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-xl text-sm font-semibold"
            >
              {t("providerProjectsDetails.start")}
            </button>
          )}

          {statusId === 602 && (
            <button
              onClick={() => handleAction("complete")}
              disabled={loadingCreateState}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl text-sm font-semibold"
            >
              {t("providerProjectsDetails.complete")}
            </button>
          )}

          {/* {(statusId === 606 || statusId === 603) && (
            <span className="text-green-600 font-semibold border border-green-200 bg-green-50 py-2 px-4 rounded-xl text-sm">
              الطلب مكتمل ✅
            </span>
          )} */}
        </div>

        <UploadAdminAttachments projectData={projectData} refetch={refetch} />
      </div>
    </div>
  );
};

export default ProviderProjectsDetails;
