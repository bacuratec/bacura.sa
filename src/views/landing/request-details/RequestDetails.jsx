import React, { useContext, useEffect, useState } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import RequestDetailsInfo from "../../../components/admin-components/requests/RequestDetails";
import { useRouter } from "next/navigation";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import { useGetRequestDetailsQuery, useRequesterRespondPriceMutation, useGetOrderByRequestQuery } from "../../../redux/api/ordersApi";
import RequesterAttachmentForm from "../../../components/request-service-forms/RequesterAttachmentForm";
import RequestAttachment from "../../../components/request-service-forms/RequestAttachment";
import RequestStatusStepper from "../../../components/landing-components/request-service/RequestStatusStepper";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import PaymentForm from "../../../components/landing-components/request-service/PaymentForm";
import ProjectDeliverables from "../../../components/landing-components/request-service/ProjectDeliverables";

import { DetailPageSkeleton } from "../../../components/shared/skeletons/PageSkeleton";

const RequestDetails = ({ initialData, id }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const [showPayment, setShowPayment] = useState(null);
  const router = useRouter();

  const requestId = initialData?.id || id;

  const {
    data: requestData,
    refetch: refetchRequesterDetails,
    isLoading: loadingRequester,
  } = useGetRequestDetailsQuery(requestId, { skip: !!initialData || !requestId });

  const { data: orderData } = useGetOrderByRequestQuery(requestId);

  const [respondPrice] = useRequesterRespondPriceMutation();
  const [adminData, setAdminData] = useState(null);

  const data = requestData || initialData || adminData;

  const attachments = Array.isArray(data?.attachments) ? data.attachments : [];

  useEffect(() => {
    const status = requestData?.status || data?.status;
    const code = status?.code || "";

    // Payment Logic: Show only if accepted and NOT paid
    if (data?.requester_accepted_price && data?.payment_status !== 'paid') {
      const amt = data?.admin_price ?? data?.servicePrice ?? data?.service?.price ?? data?.service?.base_price;
      if (typeof amt === "number" && Number.isFinite(amt) && amt > 0) {
        setShowPayment({
          amount: amt,
          consultationId: data?.id,
        });
      }
    } else {
      setShowPayment(null);
    }
  }, [data, requestData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    const fetchAdmin = async () => {
      if (data || !requestId) return;
      try {
        const res = await fetch("/api/requests/admin-get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: requestId }),
        });
        const json = await res.json();
        if (json?.data) setAdminData(json.data);
      } catch { }
    };
    fetchAdmin();
  }, [data, requestId]);
  if (loadingRequester && !adminData) {
    return <DetailPageSkeleton />;
  }

  if (!data) {
    return <UnavailableDetails id={requestId} />;
  }
  return (
    <div className="py-10">
      <title>{t("requestDetails.title")}</title>
      <meta name="description" content={t("request.requestDescription")} />
      <div className="container">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2"
          >
            {t("back") || "Back"}
          </button>
        </div>
        <HeadTitle
          title={t("requestDetails.title")}
          type={
            lang === "ar"
              ? (data?.status?.name_ar || data?.requestStatus?.nameAr)
              : (data?.status?.name_en || data?.requestStatus?.nameEn)
          }
          status={data?.status?.id || data?.requestStatus?.id}
        />
        <RequestStatusStepper status={data?.status || data?.requestStatus} />
        <RequestDetailsInfo data={data} refetch={refetchRequesterDetails} />
        <RequestAttachment attachments={attachments} />
        {(data?.admin_price || data?.admin_notes || data?.admin_proposal_file_url) && (
          <div className="mt-4 rounded-xl border border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-800 font-bold">{t("requestDetails.adminOffer") || "عرض الإدارة"}</div>
              {typeof data?.admin_price === "number" && (
                <div className="text-sm text-primary font-semibold">{t("requestDetails.adminPrice") || "السعر"}: {data.admin_price}</div>
              )}
            </div>
            {data?.admin_notes && (
              <p className="text-sm text-gray-700 mb-2">{data.admin_notes}</p>
            )}
            {data?.admin_proposal_file_url && (
              <a
                href={data.admin_proposal_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-primary underline text-sm"
              >
                {t("requestDetails.downloadProposal") || "تحميل ملف العرض"}
              </a>
            )}
          </div>
        )}
        {data?.requestStatus?.id === 501 && (
          <RequesterAttachmentForm
            data={data}
            refetch={refetchRequesterDetails}
          />
        )}
        {/* قبول/رفض السعر من طالب الخدمة */}
        {data?.admin_price && !data?.requester_accepted_price && !data?.requester_rejection_reason && (data?.status?.code === "priced" || data?.requestStatus?.id === 8 || data?.requestStatus?.id === 501) && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t("requestDetails.priceProposal") || "عرض السعر المقدم"}</h3>
                <p className="text-sm text-gray-600 mb-3">{t("requestDetails.priceProposalDesc") || "يرجى مراجعة السعر المقترح من الإدارة للمتابعة"}</p>
                <div className="text-2xl font-bold text-primary">
                  {data.admin_price} <span className="text-sm font-normal text-gray-500">{t("currency.sar") || "ر.س"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  className="flex-1 md:flex-none btn btn-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-white font-bold"
                  onClick={async () => {
                    await respondPrice({ requestId, accepted: true, statusId: 21 }).unwrap(); // 21 = waiting_payment
                    refetchRequesterDetails();
                  }}
                >
                  {t("common.accept") || "قبول العرض"}
                </button>
                <button
                  className="flex-1 md:flex-none btn bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 px-6 py-3 rounded-xl transition-all font-medium"
                  onClick={async () => {
                    const reason = window.prompt(t("requestDetails.rejectReason") || "سبب الرفض؟") || "";
                    if (reason) {
                      await respondPrice({ requestId, accepted: false, rejectionReason: reason, statusId: 10 }).unwrap(); // 10 = rejected
                      refetchRequesterDetails();
                    }
                  }}
                >
                  {t("common.reject") || "رفض"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* حالة الرفض */}
        {data?.requester_rejection_reason && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">{t("requestDetails.youRejected") || "لقد قمت برفض السعر المقترح"}</p>
            <p className="text-sm text-red-600 mt-1">{t("requestDetails.reason") || "السبب"}: {data.requester_rejection_reason}</p>
          </div>
        )}

        {/* حالة القبول */}
        {data?.requester_accepted_price && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-green-800 font-bold">{t("requestDetails.priceAccepted") || "تم قبول السعر"}</h3>
                <p className="text-green-700">{t("requestDetails.waitingPayment") || "يرجى إتمام عملية الدفع لبدء العمل"}</p>
              </div>
              {/* Provider Card if assigned */}
              {data?.provider && (
                <div className="bg-white/50 p-3 rounded-lg text-sm text-green-900 border border-green-100">
                  <span className="font-bold block mb-1">{t("requestDetails.provider") || "مزود الخدمة"}:</span>
                  {data.provider.name}
                </div>
              )}
            </div>
          </div>
        )}

        {showPayment && !data?.payment_status?.includes('paid') && (
          <div className="mt-6">
            <PaymentForm
              amount={showPayment.amount}
              consultationId={showPayment.consultationId}
              refetch={refetchRequesterDetails}
            />
          </div>
        )}

        {/* عرض التسليمات إذا وجد طلب مرتبط */}
        {(orderData?.id || data?.orderId) && (
          <ProjectDeliverables orderId={orderData?.id || data?.orderId} />
        )}
      </div>
    </div>
  );
};

export default RequestDetails;

const UnavailableDetails = ({ id }) => {
  const { t } = useTranslation();
  const [state, setState] = useState({ loading: true, exists: false });
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/requests/check-exists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        setState({ loading: false, exists: !!data?.exists });
      } catch {
        setState({ loading: false, exists: false });
      }
    };
    if (id) check();
  }, [id]);
  if (state.loading) return <DetailPageSkeleton />;
  if (!state.exists) return <NotFound />;
  return (
    <div className="container mx-auto p-8">
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6 text-yellow-800">
        <h3 className="text-lg font-bold mb-2">{t("error.boundary.title") || "حدث خطأ غير متوقع"}</h3>
        <p className="text-sm">{t("requestsUser.notAuthorized") || "لا تملك صلاحية عرض هذا الطلب"}</p>
        <div className="mt-4">
          <a href="/requests" className="px-4 py-2 bg-black text-white rounded-lg">
            {t("common.viewAll") || "عرض الطلبات"}
          </a>
        </div>
      </div>
    </div>
  );
};
