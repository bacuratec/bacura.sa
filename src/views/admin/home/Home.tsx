import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetAdminStatisticsQuery } from "@/redux/api/adminStatisticsApi";
import { useGetPaymentsQuery } from "@/redux/api/paymentApi";
import {
  Users,
  ClipboardList,
  Wallet,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Briefcase,
  Zap,
  ShieldCheck,
  CreditCard,
  History,
  Calendar

} from "lucide-react";
import Link from "next/link";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";
import { tr as trHelper } from "@/utils/tr";
import { formatAmount, formatDate } from "@/utils/format";

/**
 * Admin Home Component
 * High-performance, premium dashboard for system administration.
 * Fixed: Translation errors, styling issues, and data mapping.
 */
const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "ar";
  const { data: stats, isLoading } = useGetAdminStatisticsQuery({});
  const { data: paymentsData } = useGetPaymentsQuery({});
  const [currentTime, setCurrentTime] = useState(new Date());

  const tr = (key: string, fallback: string) => trHelper(t, key, fallback);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return <TablePageSkeleton />;

  const totalAmountNum = typeof stats?.totalFinancialAmounts === "number"
    ? stats.totalFinancialAmounts
    : Number(stats?.totalFinancialAmounts || 0);

  // Robust currency label
  const currencyLabel = t("currency.sar") || "SAR";

  const mainStats = [
    {
      title: t("homeAdmin.users"),
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      link: "/admin/requesters",
      subStats: [
        { label: t("homeAdmin.requesters"), value: stats?.totalRequesters || 0 },
        { label: t("homeAdmin.providers"), value: stats?.totalProviders || 0 },
      ]
    },
    {
      title: t("homeAdmin.requests"),
      value: stats?.totalRequests || 0,
      icon: <ClipboardList className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      link: "/admin/requests",
      subStats: [
        { label: t("requests.stats.new") || "طلبات جديدة", value: stats?.newRequestsCount || 0 },
        { label: t("requests.stats.paid") || "طلبات مدفوعة", value: stats?.paidRequestsCount || 0 },
      ]
    },
    {
      title: t("projects.title") || "المشاريع",
      value: stats?.totalProjects || 0,
      icon: <Briefcase className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
      link: "/admin/projects",
      subStats: [
        { label: t("homeAdmin.totalOrders"), value: stats?.totalOrders || 0 },
      ]
    },
    {
      title: t("homeAdmin.financialTransactions"),
      value: formatAmount(totalAmountNum, currencyLabel),
      icon: <Wallet className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      link: "/admin/payments",
      subStats: [
        { label: t("homeAdmin.totalAmount"), value: formatAmount(totalAmountNum, currencyLabel) },
      ]
    }
  ];

  // Process actual payments data
  const recentPayments = (Array.isArray(paymentsData) ? paymentsData : (paymentsData?.data || [])).slice(0, 4);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-[#FAFBFF]">
      <title>{t("homeAdmin.title")}</title>

      {/* Header Section */}
      <header className="relative p-8 md:p-12 rounded-[3.5rem] bg-indigo-950 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-indigo-200 tracking-wider uppercase">System Live</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {t("homeAdmin.title")}
            </h1>
            <p className="text-indigo-200/70 text-lg font-medium max-w-2xl leading-relaxed">
              {t("homeAdmin.description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="px-8 py-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-xl group hover:bg-white/10 transition-all">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-1">{t("common.date") || "الوقت الآن"}</p>
              <p className="text-3xl font-black tracking-tight">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="bg-white px-8 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 text-gray-900 group hover:scale-[1.02] transition-all duration-500 cursor-pointer">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{tr("homeAdmin.performance", "الأداء العام")}</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black">+12.5%</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-200">↑ {t("homeAdmin.growth") || "نمو"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {mainStats.map((stat, index) => (
          <Link
            href={stat.link}
            key={index}
            className="group relative bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col min-h-[320px]"
          >
            <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 blur-3xl rounded-full`} />

            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pointer-events-none">
                <div className={`w-16 h-16 ${stat.lightColor} ${stat.textColor} rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                  {stat.icon}
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg transition-all duration-300">
                  <ArrowUpRight size={20} />
                </div>
              </div>

              <div className="space-y-2 mt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight break-all">
                  {stat.value}
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-50 grid grid-cols-2 gap-6">
              {stat.subStats.map((sub, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] truncate">{sub.label}</span>
                  <span className="text-base font-black text-gray-800">{typeof sub.value === 'number' ? sub.value.toLocaleString() : sub.value}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Recent Activity Section */}
        <section className="lg:col-span-7 bg-white rounded-[4rem] p-10 border border-gray-100 shadow-xl relative overflow-hidden group/activity">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                <Zap size={28} />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-gray-900">{t("homeAdmin.activity") || "أحدث النشاطات"}</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("homeAdmin.realtimeUpdates") || "تحديثات فورية"}</p>
              </div>
            </div>
            <Link href="/admin/requests" className="px-8 py-3 bg-gray-50 text-gray-600 rounded-3xl font-black text-xs hover:bg-primary hover:text-white hover:shadow-xl transition-all duration-300 flex items-center gap-2 group/btn">
              {t("viewAll") || "عرض الكل"}
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1" />
            </Link>
          </div>

          <div className="space-y-5">
            {[
              { id: 1, title: "طلب صيانة جديد من شركة الأمل", type: "خدمة جديدة", time: "5 دقائق", color: "text-blue-600 bg-blue-50" },
              { id: 2, title: "اكتمال مشروع توريد مواد بناء", type: "مكتمل", time: "15 دقيقة", color: "text-emerald-600 bg-emerald-50" },
              { id: 3, title: "تسجيل مزود خدمة جديد: م. خالد", type: "تسجيل جديد", time: "40 دقيقة", color: "text-amber-600 bg-amber-50" },
              { id: 4, title: "عملية دفع مؤكدة بقيمة 15,000 ريال", type: "مدفوع", time: "ساعة واحدة", color: "text-purple-600 bg-purple-50" },
            ].map((activity) => (
              <div key={activity.id} className="group flex items-center gap-6 p-6 rounded-[2.5rem] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 hover:shadow-lg">
                <div className={`w-14 h-14 rounded-2xl ${activity.color} flex items-center justify-center font-bold text-lg shadow-inner`}>
                  #{activity.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-800 text-lg mb-2 truncate group-hover:text-primary transition-colors">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Clock size={14} className="text-gray-300" /> {activity.time}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-4 py-1 rounded-full border ${activity.color}`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                  <ChevronRight size={24} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action & Payments Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-10">

          {/* Quick Actions Card */}
          <section className="bg-gradient-to-br from-indigo-800 via-indigo-900 to-black rounded-[4rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col justify-between h-full space-y-12">
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                  <ShieldCheck size={40} />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black leading-tight tracking-tight">{tr("homeAdmin.quickActions", "إجراءات سريعة")}</h2>
                  <p className="text-indigo-200/80 text-base font-medium leading-relaxed">
                    {tr("homeAdmin.quickActionsDesc", "إدارة العمليات اليومية بكفاءة عالية وبنقرة واحدة.")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center justify-center gap-4 bg-white text-indigo-950 font-black py-5 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.98]">
                  <Zap size={22} className="text-primary" />
                  {tr("homeAdmin.generateReport", "إنشاء تقرير فوري")}
                </button>
                <Link href="/admin/add-service" className="flex items-center justify-center gap-4 bg-white/10 backdrop-blur-2xl text-white font-black py-5 rounded-3xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center">
                  <CreditCard size={22} />
                  {tr("homeAdmin.addService", "إضافة خدمة جديدة")}
                </Link>
              </div>
            </div>
          </section>

          {/* Real Wallet Section */}
          <section className="bg-white rounded-[4rem] p-10 border border-gray-100 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  <History size={28} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900">{tr("homeAdmin.wallet", "المحفظة")}</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tr("homeAdmin.recentTransactions", "آخر المعاملات")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-emerald-600 leading-none mb-1">{formatAmount(totalAmountNum, currencyLabel)}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("homeAdmin.totalBalance") || "إجمالي الرصيد"}</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-5 rounded-3xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="min-w-0 pr-4">
                    <p className="font-black text-gray-800 text-sm truncate">
                      {p.request?.title || p.order?.order_title || `${tr("homeAdmin.payment", "دفعة")} #${String(p.id).substring(0, 6)}`}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                      {formatDate(p.created_at, "D MMMM YYYY", lang)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-gray-900">{formatAmount(p.amount, p.currency || currencyLabel)}</p>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tighter capitalize">{p.payment_status || "confirmed"}</span>
                  </div>
                </div>
              ))}

              {recentPayments.length === 0 && (
                <div className="py-10 text-center text-gray-400 font-medium">
                  {tr("homeAdmin.noPayments", "لا توجد معاملات بعد")}
                </div>
              )}
            </div>

            <Link href="/admin/payments" className="mt-8 py-5 bg-gray-50 rounded-3xl text-xs font-black text-gray-500 hover:bg-indigo-600 hover:text-white transition-all text-center uppercase tracking-widest">
              {t("viewAll") || "عرض السجل المالي"}
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
