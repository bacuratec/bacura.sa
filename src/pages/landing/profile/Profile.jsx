import { useEffect, useState } from "react";
import WelcomeTitle from "../../../components/landing-components/profile-components/welcomeTitle";
import DashboardInfo from "../../../components/landing-components/profile-components/DashboardInfo";
import Services from "../../../components/landing-components/profile-components/Services";
import Mesages from "../../../components/landing-components/profile-components/Mesages";
import Support from "../../../components/landing-components/profile-components/Support";
import { useGetRequesterDetailsQuery } from "../../../redux/api/usersDetails";
import { useSelector } from "react-redux";
import LoadingPage from "../../LoadingPage";
import UserData from "../../../components/shared/profile-details/UserData";
import SuspendModal from "../../../components/shared/suspend-modal/SuspendModal";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";
import { useGetTicketsQuery } from "../../../redux/api/ticketApi";
import { useGetProjectStatisticsQuery } from "../../../redux/api/projectsApi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import {
  Check,
  Clock,
  ListChecks,
  Play,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const Profile = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [openSuspend, setOpenSuspend] = useState(false);
  const userId = useSelector((state) => state.auth.userId);
  const { data, refetch, isLoading } = useGetRequesterDetailsQuery(userId);
  const {
    data: tickets,
    refetch: refetchTickets,
    isLoading: isLoadingTickets,
  } = useGetTicketsQuery();
  const { data: projectsStats } = useGetProjectStatisticsQuery({});

  const projectStatistics = [
    {
      number: projectsStats?.totalOrdersCount ?? 0,
      title: t("profile.stats.totalOrders"),
      icon: <Wallet />,
      color: "#F9FDF1",
      ic: true,
    },
    {
      number: projectsStats?.waitingForApprovalOrdersCount ?? 0,
      title: t("profile.stats.waitingApproval"),
      icon: <Clock />,
      color: "#FFF4E5",
      ic: true,
    },
    {
      number: projectsStats?.waitingToStartOrdersCount ?? 0,
      title: t("profile.stats.waitingStart"),
      icon: <Play />,
      color: "#F0F7FF",
      ic: true,
    },
    {
      number: projectsStats?.ongoingOrdersCount ?? 0,
      title: t("profile.stats.ongoing"),
      icon: <ListChecks />,
      color: "#EAF9F0",
      ic: true,
    },
    {
      number: projectsStats?.completedOrdersCount ?? 0,
      title: t("profile.stats.completed"),
      icon: <Check />,
      color: "#F1F1FD",
      ic: true,
    },
    {
      number: projectsStats?.serviceCompletedOrdersCount ?? 0,
      title: t("profile.stats.servicesCompleted"),
      icon: <ShieldCheck />,
      color: "#FDF6F1",
      ic: true,
    },
  ];

  if (isLoading || !data || isLoadingTickets) {
    return <LoadingPage />;
  }
  return (
    <div className="pt-6">
      <title>{t("mobileMenu.myProfile")}</title>
      <meta name="description" content={t("profile.subtitle")} />
      <div className="container">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 md:col-span-3">
            <div className="flex flex-col xl:gap-8 lg:gap-6 md:gap-4 gap-3">
              {/* <div className="flex justify-between items-center gap-3"> */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <WelcomeTitle
                  name={data?.name ?? data?.fullName}
                  joinAt={data?.creationTime}
                  data={data}
                  refetch={refetch}
                />
              </motion.div>
              {/* </div> */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <UserData data={data} refetch={refetch} />
              </motion.div>
              <AttachmentsTable attachments={data?.attachments} />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DashboardInfo
                  stats={projectStatistics}
                  title={t("profile.dashboard")}
                />
              </motion.div>
              {/* <ExploreRequests /> */}
              <Services />
              <Mesages tickets={tickets} />
              <Support refetch={refetchTickets} />
              <button
                onClick={() => setOpenSuspend(true)}
                className="w-fit bg-red-600 py-2 px-4 rounded-lg text-white font-medium flex items-center gap-2 mr-auto"
              >
                {t("profile.suspendAccount")}
              </button>
            </div>

            <SuspendModal open={openSuspend} setOpen={setOpenSuspend} />
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
