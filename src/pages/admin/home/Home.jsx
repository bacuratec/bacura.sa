import { useEffect, useState } from "react";
import Statistics from "@/components/admin-components/home/statistics/Statistics";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import activeRequest from "@/assets/icons/activeRequest.svg";
import pendingRequest from "@/assets/icons/pendingRequest.svg";
import completedProjects from "@/assets/icons/completedProjects.svg";
import paidReciet from "@/assets/icons/paidReciet.svg";
import BarchartStats from "../../../components/shared/barChart/BarChart";
import {
  Wallet,
  Stethoscope,
  MessageCircleQuestion,
  // Wrench,
  // GraduationCap,
  // Ruler,
  // FileSignature,
  // Briefcase,
  // Truck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

const Home = () => {
  const { t } = useTranslation();
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [usersRes, requestersRes, providersRes, requestsRes] =
          await Promise.all([
            supabase
              .from("users")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("requesters")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("providers")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("requests")
              .select("id", { count: "exact", head: true }),
          ]);

        setAdminStats({
          users: {
            totalUsersCount: usersRes.count || 0,
            totalRequestersCount: requestersRes.count || 0,
            totalProvidersCount: providersRes.count || 0,
          },
          requests: {
            totalRequests: requestsRes.count || 0,
            // الحقول المتبقية يمكن حسابها لاحقًا عند نقل منطق أنواع الطلبات
            totalRequestsRequesters: 0,
            projectsDiagnosisRequests: 0,
            consultationsRequests: 0,
            maintenanceContractsRequests: 0,
            trainingRequests: 0,
            projectsSupervisionRequests: 0,
            executionContractsRequests: 0,
            projectsManagementRequests: 0,
            wholesaleSupplyRequests: 0,
          },
          financialAmounts: {
            totalFinancialAmounts: 0,
            consultationsFinancialAmounts: 0,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching admin statistics from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const usersStats = [
    {
      number: adminStats?.users?.totalUsersCount ?? 0,
      title: t("homeAdmin.users"),
      icon: activeRequest,
      color: "#F9FDF1",
    },
  ];
  const usersStatistics = [
    {
      number: adminStats?.users?.totalUsersCount ?? 0,
      title: "المستخدمين",
      icon: activeRequest,
      color: "#F9FDF1",
    },
    {
      number: adminStats?.users?.totalRequestersCount ?? 0,
      title: t("homeAdmin.requesters"),
      icon: activeRequest,
      color: "#F9FDF1",
    },
    {
      number: adminStats?.users?.totalProvidersCount ?? 0,
      title: t("homeAdmin.providers"),
      icon: activeRequest,
      color: "#F9FDF1",
    },
  ];
  const requestsStats = [
    {
      number: adminStats?.requests?.totalRequests ?? 0,
      title: t("homeAdmin.totalRequests"),
      icon: activeRequest,
      color: "#F9FDF1",
    },
  ];
  const requestsStatistics = [
    {
      number: adminStats?.requests?.totalRequests ?? 0,
      title: "جميع الطلبات",
      icon: activeRequest,
      color: "#F9FDF1",
    },
    {
      number: adminStats?.requests?.totalRequestsRequesters ?? 0,
      title: t("homeAdmin.newRequest"),
      icon: pendingRequest,
      color: "#FFDD031A",
    },
    {
      number: adminStats?.requests?.projectsDiagnosisRequests ?? 0,
      title: t("homeAdmin.diagnosis"),
      icon: completedProjects,
      color: "#0071FF1A",
    },
    {
      number: adminStats?.requests?.consultationsRequests ?? 0,
      title: t("homeAdmin.consultations"),
      icon: completedProjects,
      color: "#E0F7FA",
    },
    {
      number: adminStats?.requests?.maintenanceContractsRequests ?? 0,
      title: t("homeAdmin.maintenanceContracts"),
      icon: paidReciet,
      color: "#7D99BC1A",
    },
    {
      number: adminStats?.requests?.trainingRequests ?? 0,
      title: t("homeAdmin.training"),
      icon: completedProjects,
      color: "#FF62001A",
    },
    {
      number: adminStats?.requests?.projectsSupervisionRequests ?? 0,
      title: t("homeAdmin.supervision"),
      icon: pendingRequest,
      color: "#FFDD031A",
    },
    {
      number: adminStats?.requests?.executionContractsRequests ?? 0,
      title: t("homeAdmin.executionContracts"),
      icon: completedProjects,
      color: "#D1C4E9",
    },
    {
      number: adminStats?.requests?.projectsManagementRequests ?? 0,
      title: t("homeAdmin.management"),
      icon: activeRequest,
      color: "#FCE4EC",
    },
    {
      number: adminStats?.requests?.wholesaleSupplyRequests ?? 0,
      title: t("homeAdmin.wholesale"),
      icon: pendingRequest,
      color: "#C8E6C9",
    },
  ];
  const financialStats = [
    {
      number: adminStats?.financialAmounts?.totalFinancialAmounts ?? 0,
      title: t("homeAdmin.totalAmount"),
      icon: <Wallet />,
      color: "#F9FDF1",
      ic: true,
    },
  ];
  const financialStatistics = [
    {
      number: adminStats?.financialAmounts?.totalFinancialAmounts ?? 0,
      title: "إجمالي المبالغ",
      icon: <Wallet />,
      color: "#F9FDF1",
      ic: true,
    },
    {
      number: adminStats?.financialAmounts?.consultationsFinancialAmounts ?? 0,
      title: t("homeAdmin.consultationAmount"),
      icon: <MessageCircleQuestion />,
      color: "#FFF3E0",
      ic: true,
    },
    {
      number:
        adminStats?.financialAmounts?.totalFinancialAmounts -
          adminStats?.financialAmounts?.consultationsFinancialAmounts || 0,
      title: t("homeAdmin.otherAmount"),
      icon: <Stethoscope />,
      color: "#E3F2FD",
      ic: true,
    },
    // {
    //   number:
    //     AdminStats?.financialAmounts?.maintenanceContractsFinancialAmounts ?? 0,
    //   title: "مبالغ عقود الصيانة",
    //   icon: <Wrench />,
    //   color: "#E8F5E9",
    //   ic: true,
    // },
    // {
    //   number: AdminStats?.financialAmounts?.trainingFinancialAmounts ?? 0,
    //   title: "مبالغ التدريب",
    //   icon: <GraduationCap />,
    //   color: "#FCE4EC",
    //   ic: true,
    // },
    // {
    //   number:
    //     AdminStats?.financialAmounts?.projectsSupervisionFinancialAmounts ?? 0,
    //   title: "مبالغ إشراف المشاريع",
    //   icon: <Ruler />,
    //   color: "#FFFDE7",
    //   ic: true,
    // },
    // {
    //   number:
    //     AdminStats?.financialAmounts?.executionContractsFinancialAmounts ?? 0,
    //   title: "مبالغ عقود التنفيذ",
    //   icon: <FileSignature />,
    //   color: "#E1F5FE",
    //   ic: true,
    // },
    // {
    //   number:
    //     AdminStats?.financialAmounts?.projectsManagementFinancialAmounts ?? 0,
    //   title: "مبالغ إدارة المشاريع",
    //   icon: <Briefcase />,
    //   color: "#F3E5F5",
    //   ic: true,
    // },
    // {
    //   number:
    //     AdminStats?.financialAmounts?.wholesaleSupplyFinancialAmounts ?? 0,
    //   title: "مبالغ توريد الجملة",
    //   icon: <Truck />,
    //   color: "#E0F7FA",
    //   ic: true,
    // },
  ];

  return (
    <div>
      <title>{t("homeAdmin.title")}</title>
      <meta name="description" content={t("homeAdmin.description")} />
      <HeadTitle
        title={t("homeAdmin.title")}
        // description={t("homeAdmin.description")}
      />
      <div className="flex flex-col gap-5">
        <div className="flex items-start flex-wrap">
          <Statistics
            stats={financialStats}
            title={t("homeAdmin.financialTransactions")}
          />
          <BarchartStats data={financialStatistics} />
        </div>
        <div className="flex items-start flex-wrap">
          <Statistics stats={requestsStats} title={t("homeAdmin.requests")} />
          <BarchartStats data={requestsStatistics} />
        </div>
        <div className="flex items-start flex-wrap">
          <Statistics stats={usersStats} title={t("homeAdmin.users")} />
          <BarchartStats data={usersStatistics} />
        </div>
      </div>
      {/* <NewOrders /> */}
    </div>
  );
};

export default Home;
