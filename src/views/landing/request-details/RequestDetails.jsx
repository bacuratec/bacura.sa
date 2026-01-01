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
          <div className="mt-8 rounded-3xl border border-gray-100 p-8 bg-white shadow-custom animate-fade-in-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
              <div className="text-lg text-gray-900 font-bold flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                {t("requestDetails.adminOffer") || "عرض الإدارة"}
              </div>
              {/* Price moved inside Proposal Card for better flow, or kept here if accepted */}
            </div>

            {/* Show Price Prominently */}
            {typeof data?.admin_price === "number" && (
              <div className="mb-6 flex items-end gap-2 text-3xl font-bold text-primary">
                {data.admin_price}
                <span className="text-sm font-medium text-gray-500 mb-1.5">{t("currency.sar") || "ر.س"}</span>
              </div>
            )}

            {data?.admin_notes && (
              <div className="bg-gray-50/50 rounded-2xl p-5 mb-4 text-gray-600 leading-relaxed border border-gray-100">
                {data.admin_notes}
              </div>
            )}

            {data?.admin_proposal_file_url && (
              <a
                href={data.admin_proposal_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary bg-primary/5 hover:bg-primary/10 px-5 py-2.5 rounded-xl font-bold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
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

        {/* Action Card: Accept/Reject Price */}
        {data?.admin_price && !data?.requester_accepted_price && !data?.requester_rejection_reason && (data?.status?.code === "priced" || data?.requestStatus?.id === 8 || data?.requestStatus?.id === 501) && (
          <div className="mt-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-white p-8 shadow-lg shadow-primary/5 animate-fade-in-up relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("requestDetails.priceProposal") || "عرض السعر المقدم"}</h3>
                <p className="text-gray-500 max-w-md">{t("requestDetails.priceProposalDesc") || "يرجى مراجعة السعر المقترح من الإدارة للمتابعة. عند القبول، سينتقل الطلب لمرحلة الدفع."}</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  className="flex-1 md:flex-none btn btn-primary px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all text-white font-bold text-lg transform hover:-translate-y-0.5"
                  onClick={async () => {
                    await respondPrice({ requestId, accepted: true, statusId: 21 }).unwrap();
                    refetchRequesterDetails();
                  }}
                >
                  {t("common.accept") || "قبول العرض"}
                </button>
                <button
                  className="flex-1 md:flex-none btn bg-white text-red-500 border-2 border-red-50 hover:border-red-200 hover:bg-red-50 px-8 py-4 rounded-2xl transition-all font-bold text-lg"
                  onClick={async () => {
                    const reason = window.prompt(t("requestDetails.rejectReason") || "سبب الرفض؟") || "";
                    if (reason) {
                      await respondPrice({ requestId, accepted: false, rejectionReason: reason, statusId: 10 }).unwrap();
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
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 p-6 flex gap-4 items-start">
            <div className="p-2 bg-red-100 rounded-full text-red-600 mt-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div>
              <p className="text-red-800 font-bold text-lg mb-1">{t("requestDetails.youRejected") || "تم رفض العرض"}</p>
              <p className="text-red-600/80">{t("requestDetails.reason") || "السبب"}: {data.requester_rejection_reason}</p>
            </div>
          </div>
        )}

        {/* حالة القبول */}
        {data?.requester_accepted_price && (
          <div className="mt-6 rounded-3xl border border-green-200 bg-gradient-to-r from-green-50 to-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 className="text-green-900 font-bold text-lg">{t("requestDetails.priceAccepted") || "تم قبول السعر بنجاح"}</h3>
                  <p className="text-green-700/80">{t("requestDetails.waitingPayment") || "يرجى استكمال عملية الدفع أدناه لبدء التنفيذ"}</p>
                </div>
              </div>

              {/* Provider Card if assigned */}
              {data?.provider && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <span className="text-xs text-green-700 font-bold block">{t("requestDetails.provider") || "مزود الخدمة"}</span>
                    <span className="text-gray-900 font-medium">{data.provider.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showPayment && !data?.payment_status?.includes('paid') && (
          <div className="mt-8 bg-white rounded-3xl shadow-custom border border-gray-100 p-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary to-primary" />
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{t("payment.title") || "الدفع الإلكتروني"}</h3>
              <p className="text-gray-500 mt-1">{t("payment.secure") || "عملية دفع آمنة ومشفرة"}</p>
            </div>

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
