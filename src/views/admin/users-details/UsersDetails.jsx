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

  if (!data) {
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
          data={data}
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
        <AttachmentsTable attachments={data?.attachments} />
      </div>
    </div>
  );
};

export default UsersDetails;
