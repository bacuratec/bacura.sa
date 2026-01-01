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
import AdminPricingPanel from "../../../components/request-service-forms/AdminPricingPanel";
import AdminAssignProviderPanel from "../../../components/request-service-forms/AdminAssignProviderPanel";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";

const RequestDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="py-8 bg-gray-50/30 min-h-screen">
      <title>{t("requestDetails.title")}</title>
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <Link href="/admin/requests" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors gap-2 group">
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {t("requestDetails.back") || "عودة إلى قائمة الطلبات"}
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white border border-gray-200 text-gray-500 shadow-sm">
              #{data?.id?.split('-')[0]}
            </span>
          </div>

          <HeadTitle
            title={t("requestDetails.title")}
            nav1={t("requestDetails.nav1")}
            nav2={t("requestDetails.nav2")}
            type={lang === "ar" ? data?.requestStatus?.nameAr : data?.requestStatus?.nameEn}
            status={data?.requestStatus?.id}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

          {/* Main Info Columns (2/3 width) */}
          <div className="xl:col-span-2 space-y-8">
            <RequestDetailsInfo data={data} refetch={refetchRequesterDetails} />
            <RequestAttachment attachments={attachments} />
            {firstApprove && (
              <AdminAttachmentForm data={data} refetch={refetchRequesterDetails} />
            )}
            {finalApprove && (
              <AdminCompleteRequest data={data} refetch={refetchRequesterDetails} />
            )}
          </div>

          {/* Sidebar Actions (1/3 width) */}
          <div className="xl:col-span-1 space-y-8 sticky top-6">
            {/* Pricing Panel */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <AdminPricingPanel refetch={refetchRequesterDetails} />
            </div>

            {/* Provider Assignment */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <AdminAssignProviderPanel refetch={refetchRequesterDetails} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
