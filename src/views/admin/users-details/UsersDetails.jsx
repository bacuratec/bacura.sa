"use client";
import React, { useEffect } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import UserData from "../../../components/admin-components/users-details/UserData";
import { usePathname, useParams } from "next/navigation";
import {
  useGetProviderDetailsQuery,
  useGetRequesterDetailsQuery,
} from "../../../redux/api/usersDetails";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";
import Statistics from "@/components/admin-components/home/statistics/Statistics";
import { Wallet, Clock3, Check, Star, Ban } from "lucide-react"; // أيقونات افتراضية
import { useTranslation } from "react-i18next";

const UsersDetails = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const pathname = usePathname();

  const isProvider = pathname.includes("/admin/provider");

  const { id } = useParams();

  const {
    data: providerData,
    refetch: refetchProviderDetails,
    isLoading: loadingProvider,
  } = useGetProviderDetailsQuery(id, { skip: !isProvider });

  const {
    data: requesterData,
    refetch: refetchRequesterDetails,
    isLoading: loadingRequester,
  } = useGetRequesterDetailsQuery(id, { skip: isProvider });

  if ((isProvider && loadingProvider) || (!isProvider && loadingRequester)) {
    return <LoadingPage />;
  }
  const data = isProvider ? providerData : requesterData;

  // Fallback data to allow UI development without backend connection
  const displayData = data || {
    id: id || "mock-id",
    name: "بيانات افتراضية (وضع التطوير)",
    email: "dev@example.com",
    phoneNumber: "0500000000",
    city: { nameAr: "الرياض", nameEn: "Riyadh", name_ar: "الرياض", name_en: "Riyadh" },
    entityType: { nameAr: "شركة", nameEn: "Company", name_ar: "شركة", name_en: "Company" },
    user: { is_blocked: false, email: "dev@example.com", phone: "0500000000" },
    profileStatus: { id: 201, nameAr: "نشط", nameEn: "Active" },
    attachments: []
  };

  if (!displayData) {
    return <NotFound />;
  }

  const financialStats = [
    {
      number: 0,
      title: t("userDetails.totalOrders"),
      icon: <Wallet />,
      color: "#F9FDF1",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.waitingApproval"),
      icon: <Clock3 />,
      color: "#FFF7ED",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.ongoingOrders"),
      icon: <Clock3 />,
      color: "#E0F2FE",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.completedOrders"),
      icon: <Check />,
      color: "#DCFCE7",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.rejectedOrders"),
      icon: <Ban />,
      color: "#FEE2E2",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.averageRating"),
      icon: <Star />,
      color: "#FEF9C3",
      ic: true,
    },
  ];

  return (
    <div className="py-10">
      <title>
        {isProvider
          ? t("userDetails.providerDetails")
          : t("userDetails.requesterDetails")}
        nav1=
        {isProvider
          ? t("userDetails.manageProviders")
          : t("userDetails.manageRequesters")}
        nav2=
        {isProvider
          ? t("userDetails.providerDetails")
          : t("userDetails.requesterDetails")}
      </title>
      <div className="container">
        <HeadTitle
          title={
            isProvider
              ? t("userDetails.providerDetails")
              : t("userDetails.requesterDetails")
          }
          nav1={
            isProvider
              ? t("userDetails.manageProviders")
              : t("userDetails.manageRequesters")
          }
          nav2={
            isProvider
              ? t("userDetails.providerDetails")
              : t("userDetails.requesterDetails")
          }
        />
        <UserData
          data={displayData}
          refetch={
            isProvider ? refetchProviderDetails : refetchRequesterDetails
          }
        />
        <Statistics
          stats={financialStats}
          title={
            isProvider
              ? t("userDetails.providerStats")
              : t("userDetails.requesterStats")
          }
        />
        <AttachmentsTable attachments={displayData?.attachments} />
      </div>
    </div>
  );
};

export default UsersDetails;
