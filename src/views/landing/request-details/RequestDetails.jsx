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

  const data = initialData || requestData;

  const attachments = data?.attachments;

  useEffect(() => {
    const code = data?.requestStatus?.code || "";
    if (code === "priced" || code === "accepted") {
      setShowPayment({
        amount: data?.servicePrice ?? data?.service?.price, // Unified price retrieval
        consultationId: data?.id,
      });
    }
  }, [data]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (loadingRequester) {
    return <DetailPageSkeleton />;
  }

  if (!data) {
    return <NotFound />;
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
              ? data?.requestStatus?.nameAr
              : data?.requestStatus?.nameEn
          }
          status={data?.requestStatus?.id}
        />
        <RequestStatusStepper status={data?.requestStatus} />
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
