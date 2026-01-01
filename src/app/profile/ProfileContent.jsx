"use client";

import { useEffect, useState } from "react";
import WelcomeTitle from "@/components/landing-components/profile-components/welcomeTitle";
import DashboardInfo from "@/components/landing-components/profile-components/DashboardInfo";
import Services from "@/components/landing-components/profile-components/Services";
import RecentRequests from "@/components/landing-components/profile-components/RecentRequests";
import Messages from "@/components/landing-components/profile-components/Messages";
import Support from "@/components/landing-components/profile-components/Support";
import LoadingPage from "@/views/LoadingPage";
import UserData from "@/components/shared/profile-details/UserData";
import SuspendModal from "@/components/shared/suspend-modal/SuspendModal";
import AttachmentsTable from "@/components/admin-components/projects/AttachmentsTable";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import {
  Check,
  Clock,
  ListChecks,
  Play,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import ProfileModal from "@/components/shared/profile-modal/ProfileModal";
import { useRouter } from "next/navigation";

const ProfileContent = ({ requester, tickets, stats, recentOrders }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [openSuspend, setOpenSuspend] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const projectStatistics = [
    // ... stats logic remains same
    {
      number: stats?.totalOrdersCount ?? 0,
      title: t("profile.stats.totalOrders"),
      icon: <Wallet className="w-5 h-5" />,
      color: "bg-emerald-50",
      textColor: "text-emerald-700",
      ic: true,
    },
    {
      number: stats?.waitingForApprovalOrdersCount ?? 0,
      title: t("profile.stats.waitingApproval"),
      icon: <Clock className="w-5 h-5" />,
      color: "bg-amber-50",
      textColor: "text-amber-700",
      ic: true,
    },
    {
      number: stats?.waitingToStartOrdersCount ?? 0,
      title: t("profile.stats.waitingStart"),
      icon: <Play className="w-5 h-5" />,
      color: "bg-blue-50",
      textColor: "text-blue-700",
      ic: true,
    },
    {
      number: stats?.ongoingOrdersCount ?? 0,
      title: t("profile.stats.ongoing"),
      icon: <ListChecks className="w-5 h-5" />,
      color: "bg-indigo-50",
      textColor: "text-indigo-700",
      ic: true,
    },
    {
      number: stats?.completedOrdersCount ?? 0,
      title: t("profile.stats.completed"),
      icon: <Check className="w-5 h-5" />,
      color: "bg-green-50",
      textColor: "text-green-700",
      ic: true,
    },
    {
      number: stats?.serviceCompletedOrdersCount ?? 0,
      title: t("profile.stats.servicesCompleted"),
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "bg-rose-50",
      textColor: "text-rose-700",
      ic: true,
    },
  ];

  if (!requester) {
    return <LoadingPage />;
  }

  const handleRefresh = () => {
    router.refresh(); // Refresh server data
  };

  return (
    <div className="pt-6 pb-20 bg-gray-50/30 min-h-screen">
      <title>{t("mobileMenu.myProfile")}</title>
      <meta name="description" content={t("profile.subtitle")} />
      <div className="container px-4 md:px-6">
        <div className="flex flex-col gap-10">
          {/* Top Section: Welcome & Actions */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeTitle
              name={requester?.name ?? requester?.fullName}
              joinAt={requester?.created_at}
              data={requester}
              onEdit={() => setOpenEdit(true)}
            />
          </m.div>

          {/* User Data Card */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <UserData data={requester} onEdit={() => setOpenEdit(true)} />
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <AttachmentsTable attachments={requester?.attachments} />
          </m.div>
          {/* Stats Dashboard */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardInfo
              stats={projectStatistics}
              title={t("profile.dashboard") || "لوحة التحكم والإحصائيات"}
            />
          </m.div>

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <RecentRequests orders={recentOrders} />
              <Messages tickets={tickets} />
            </div>
            <div className="lg:col-span-1 space-y-8">
              <Services />
              <Support />

              {/* Account Controls */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4">{t("profile.accountControls") || "إعدادات الحساب"}</h4>
                <button
                  onClick={() => setOpenSuspend(true)}
                  className="w-full bg-rose-50 hover:bg-rose-100 py-3 px-4 rounded-2xl text-rose-600 font-bold flex items-center justify-center gap-2 transition-colors border border-rose-100"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t("profile.suspendAccount")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ProfileModal
          open={openEdit}
          setOpen={setOpenEdit}
          data={requester}
          refetch={handleRefresh}
        />
        <SuspendModal open={openSuspend} setOpen={setOpenSuspend} />
      </div>
    </div>
  );
};

export default ProfileContent;
