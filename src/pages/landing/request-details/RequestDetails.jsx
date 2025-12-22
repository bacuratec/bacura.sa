import React, { useContext, useEffect, useState } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import RequestDetailsInfo from "../../../components/admin-components/requests/RequestDetails";
import { useParams } from "react-router-dom";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import { useGetRequestDetailsQuery } from "../../../redux/api/ordersApi";
import RequesterAttachmentForm from "../../../components/request-service-forms/RequesterAttachmentForm";
import RequestAttachment from "../../../components/request-service-forms/RequestAttachment";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import PaymentForm from "../../../components/landing-components/request-service/PaymentForm";

const RequestDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const [showPayment, setShowPayment] = useState(null);

  const { id } = useParams();
  const {
    data: requestData,
    refetch: refetchRequesterDetails,
    isLoading: loadingRequester,
  } = useGetRequestDetailsQuery(id);
  const data = requestData;

  const attachments = data?.attachments;

  useEffect(() => {
    if (data?.requestStatus?.id === 502 || data?.requestStatus?.id === 506) {
      setShowPayment({
        amount: data?.servicePrice, // Stripe uses cents
        consultationId: data?.id, // we'll use it to link payment to the order
      });
    }
  }, [data]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (loadingRequester) {
    return <LoadingPage />;
  }

  if (!data) {
    return <NotFound />;
  }
  return (
    <div className="py-10">
      <title>{t("requestDetails.title")}</title>
      <meta name="description" content={t("request.requestDescription")} />
      <div className="container">
        <HeadTitle
          title={t("requestDetails.title")}
          type={
            lang === "ar"
              ? data?.requestStatus?.nameAr
              : data?.requestStatus?.nameEn
          }
          status={data?.requestStatus?.id}
        />
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
