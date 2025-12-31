import React, { useContext, useEffect, useState } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import RequestDetailsInfo from "../../../components/admin-components/requests/RequestDetails";
import { useRouter } from "next/navigation";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import { useGetRequestDetailsQuery } from "../../../redux/api/ordersApi";
import RequesterAttachmentForm from "../../../components/request-service-forms/RequesterAttachmentForm";
import RequestAttachment from "../../../components/request-service-forms/RequestAttachment";
import RequestStatusStepper from "../../../components/landing-components/request-service/RequestStatusStepper";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import PaymentForm from "../../../components/landing-components/request-service/PaymentForm";

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
  const [adminData, setAdminData] = useState(null);

  const data = initialData || requestData || adminData;

  const attachments = Array.isArray(data?.attachments) ? data.attachments : [];

  useEffect(() => {
    const status = requestData?.status || data?.status;
    const code = status?.code || "";
    if (code === "priced" || code === "accepted") {
      const amt = data?.servicePrice ?? data?.service?.price;
      if (typeof amt === "number" && Number.isFinite(amt) && amt > 0) {
        setShowPayment({
          amount: amt,
          consultationId: data?.id,
        });
      }
    }
  }, [data, requestData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (loadingRequester && !adminData) {
    return <DetailPageSkeleton />;
  }

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
      } catch {}
    };
    fetchAdmin();
  }, [data, requestId]);
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
        {data?.requestStatus?.id === 501 && (
          <RequesterAttachmentForm
            data={data}
            refetch={refetchRequesterDetails}
          />
        )}
        {showPayment && (
          <div className="mt-6">
            <PaymentForm
              amount={showPayment.amount}
              consultationId={showPayment.consultationId}
              refetch={refetchRequesterDetails}
            />
          </div>
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
