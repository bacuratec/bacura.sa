"use client";
import React, { useContext, useEffect } from "react";
import Link from "next/link";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import RequestDetailsInfo from "../../../components/admin-components/requests/RequestDetails";
import { useParams } from "next/navigation";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import { useGetRequestDetailsQuery } from "../../../redux/api/ordersApi";
import AdminAttachmentForm from "../../../components/request-service-forms/AdminAttachmentForm";
import RequestAttachment from "../../../components/request-service-forms/RequestAttachment";
import AdminCompleteRequest from "../../../components/request-service-forms/AdminCompleteRequest";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";

const RequestDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { id } = useParams();
  const {
    data: requestData,
    refetch: refetchRequesterDetails,
    isLoading: loadingRequester,
  } = useGetRequestDetailsQuery(id);
  const data = requestData;

  const attachments = data?.attachments || [];

  const firstApprove = requestData?.requestStatus?.id === 505 || null;
  const finalApprove = requestData?.requestStatus?.id === 500 || null;

  if (loadingRequester) {
    return <LoadingPage />;
  }

  if (!data) {
    return <NotFound />;
  }
  return (
    <div className="py-10">
      <title>{t("requestDetails.title")}</title>
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin/requests" className="text-sm text-primary underline">
            {t("requestDetails.back") || "عودة إلى الطلبات"}
          </Link>
          <span className="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
            {t("requestDetails.requestId") || "رقم الطلب"}: {data?.id}
          </span>
        </div>
        <HeadTitle
          title={t("requestDetails.title")}
          nav1={t("requestDetails.nav1")}
          nav2={t("requestDetails.nav2")}
          type={
            lang === "ar"
              ? data?.requestStatus?.nameAr
              : data?.requestStatus?.nameEn
          }
          status={data?.requestStatus?.id}
        />
        <RequestDetailsInfo data={data} refetch={refetchRequesterDetails} />
        <RequestAttachment attachments={attachments} />
        {firstApprove ? (
          <AdminAttachmentForm data={data} refetch={refetchRequesterDetails} />
        ) : finalApprove ? (
          <AdminCompleteRequest data={data} refetch={refetchRequesterDetails} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default RequestDetails;
