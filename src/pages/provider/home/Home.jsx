import { useEffect } from "react";
import NewOrders from "../../../components/provider-components/home-components/new-orders/NewOrders";
import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import { useGetProviderOrderStatisticsQuery } from "../../../redux/api/adminStatisticsApi";
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
const Home = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: ProviderStats } = useGetProviderOrderStatisticsQuery();

  const ordersStatistics = [
    {
      number: ProviderStats?.totalOrdersCount ?? 0,
      title: t("providerHome.totalOrders"),
      icon: <ListChecks />,
      color: "#F0F4FF",
      ic: true,
    },
  ];

  const ordersStats = [
    {
      number: ProviderStats?.waitingForApprovalOrdersCount ?? 0,
      title: t("providerHome.waitingApproval"),
      icon: <Hourglass />,
      color: "#FFF8E1",
      ic: true,
    },
    {
      number: ProviderStats?.waitingToStartOrdersCount ?? 0,
      title: t("providerHome.waitingStart"),
      icon: <Clock />,
      color: "#E1F5FE",
      ic: true,
    },
    {
      number: ProviderStats?.ongoingOrdersCount ?? 0,
      title: t("providerHome.ongoing"),
      icon: <Loader />,
      color: "#E8F5E9",
      ic: true,
    },
    {
      number: ProviderStats?.completedOrdersCount ?? 0,
      title: t("providerHome.completed"),
      icon: <CheckCircle2 />,
      color: "#F1F8E9",
      ic: true,
    },
    {
      number: ProviderStats?.rejectedOrdersCount ?? 0,
      title: t("providerHome.rejected"),
      icon: <XCircle />,
      color: "#FFEBEE",
      ic: true,
    },
    {
      number: ProviderStats?.serviceCompletedOrdersCount ?? 0,
      title: t("providerHome.serviceCompleted"),
      icon: <ShieldCheck />,
      color: "#E8EAF6",
      ic: true,
    },
    {
      number: ProviderStats?.expiredOrdersCount ?? 0,
      title: t("providerHome.expired"),
      icon: <CalendarX />,
      color: "#FFF3E0",
      ic: true,
    },
    {
      number: ProviderStats?.averageRating ?? 0,
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
