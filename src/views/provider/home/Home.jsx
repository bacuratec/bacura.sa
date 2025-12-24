import { useEffect } from "react";
import NewOrders from "../../../components/provider-components/home-components/new-orders/NewOrders";
import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import {
  ListChecks,
  Hourglass,
  Clock,
  Loader,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CalendarX,
  Star,
} from "lucide-react";
import Statistics from "../../../components/admin-components/home/statistics/Statistics";
import BarchartStats from "../../../components/shared/barChart/BarChart";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useGetProviderStatisticsQuery } from "../../../redux/api/providerStatisticsApi";
import { useGetProviderDetailsQuery } from "../../../redux/api/usersDetails";

const Home = () => {
  const { t } = useTranslation();
  const userId = useSelector((state) => state.auth.userId);
  
  // Get provider ID from user details
  const { data: providerData } = useGetProviderDetailsQuery(userId);
  const providerId = providerData?.id;

  // Get provider statistics
  const { data: providerStats } = useGetProviderStatisticsQuery(
    providerId,
    { skip: !providerId }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ordersStatistics = [
    {
      number: providerStats?.totalOrdersCount ?? 0,
      title: t("providerHome.totalOrders"),
      icon: <ListChecks />,
      color: "#F0F4FF",
      ic: true,
    },
  ];

  const ordersStats = [
    {
      number: providerStats?.waitingForApprovalOrdersCount ?? 0,
      title: t("providerHome.waitingApproval"),
      icon: <Hourglass />,
      color: "#FFF8E1",
      ic: true,
    },
    {
      number: providerStats?.waitingToStartOrdersCount ?? 0,
      title: t("providerHome.waitingStart"),
      icon: <Clock />,
      color: "#E1F5FE",
      ic: true,
    },
    {
      number: providerStats?.ongoingOrdersCount ?? 0,
      title: t("providerHome.ongoing"),
      icon: <Loader />,
      color: "#E8F5E9",
      ic: true,
    },
    {
      number: providerStats?.completedOrdersCount ?? 0,
      title: t("providerHome.completed"),
      icon: <CheckCircle2 />,
      color: "#F1F8E9",
      ic: true,
    },
    {
      number: providerStats?.rejectedOrdersCount ?? 0,
      title: t("providerHome.rejected"),
      icon: <XCircle />,
      color: "#FFEBEE",
      ic: true,
    },
    {
      number: providerStats?.serviceCompletedOrdersCount ?? 0,
      title: t("providerHome.serviceCompleted"),
      icon: <ShieldCheck />,
      color: "#E8EAF6",
      ic: true,
    },
    {
      number: providerStats?.expiredOrdersCount ?? 0,
      title: t("providerHome.expired"),
      icon: <CalendarX />,
      color: "#FFF3E0",
      ic: true,
    },
    {
      number: providerStats?.averageRating ?? 0,
      title: t("providerHome.averageRating"),
      icon: <Star />,
      color: "#FFFDE7",
      ic: true,
    },
  ];
  return (
    <div>
      <title>{t("providerHome.title")}</title>
      <meta name="description" content={t("providerHome.description")} />
      <HeadTitle
        title={t("providerHome.title")}
        // description={t("providerHome.description")}
      />
      <div className="flex items-start flex-col lg:flex-row">
        <Statistics
          stats={ordersStatistics}
          title={t("providerHome.statisticsTitle")}
        />
        <BarchartStats data={ordersStats} />
      </div>
      <NewOrders />
    </div>
  );
};

export default Home;
