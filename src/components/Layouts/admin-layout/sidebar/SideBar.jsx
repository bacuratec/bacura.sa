import logo from "../../../../assets/images/logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BriefcaseBusiness, 
  Users, 
  FileText, 
  FolderKanban, 
  Star, 
  Layers, 
  Ticket, 
  HelpCircle, 
  FileUser, 
  Handshake, 
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../../../utils/env";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAdminStatisticsQuery } from "@/redux/api/adminStatisticsApi";

const SideBar = ({ data }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  
  const Links = [
    {
      name: t("navProvider.home"),
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: t("nav.providers"),
      href: "/admin/providers",
      icon: BriefcaseBusiness,
    },
    {
      name: t("nav.requesters"),
      href: "/admin/requesters",
      icon: Users,
    },
    {
      name: t("nav.requests"),
      href: "/admin/requests",
      icon: FileText,
    },
    {
      name: t("nav.projects"),
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      name: t("nav.rates"),
      href: "/admin/our-rates",
      icon: Star,
    },
    {
      name: t("nav.services"),
      href: "/admin/services",
      icon: Layers,
    },
    {
      name: t("nav.tickets"),
      href: "/admin/tickets",
      icon: Ticket,
    },
    {
      name: t("nav.faqs"),
      href: "/admin/faqs",
      icon: HelpCircle,
    },
    {
      name: t("footer.profile"),
      href: "/admin/profile-info",
      icon: FileUser,
    },
    {
      name: t("nav.partners"),
      href: "/admin/partners",
      icon: Handshake,
    },
    {
      name: t("nav.customers"),
      href: "/admin/customers",
      icon: UsersRound,
    },
  ];

  const imageUrl =
    typeof data?.profilePictureUrl === "string" && data.profilePictureUrl.length > 0
      ? (data.profilePictureUrl.startsWith("http")
          ? data.profilePictureUrl
          : `${getAppBaseUrl()}/${data.profilePictureUrl}`)
      : (typeof logo === "string" ? logo : (logo?.src || ""));

  const [collapsed, setCollapsed] = useState(false);
  const { data: stats } = useGetAdminStatisticsQuery();
  return (
    <aside className={`min-h-screen fixed ${collapsed ? "w-[88px]" : "w-[260px]"} bg-white border-r border-gray-200 top-0 right-0 hidden lg:flex flex-col justify-between shadow-sm z-50`}>
      <div className="logo p-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <img src={typeof logo === "string" ? logo : (logo?.src || "")} alt="Bacura" className={collapsed ? "h-8 w-8 object-contain" : "h-12 w-auto object-contain"} />
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-md p-2 hover:bg-gray-100 text-gray-700"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 sidebar-scroll">
        <ul className="flex flex-col gap-1 px-3">
          {Links.map((item, i) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.includes(item.href) && item.href !== "/admin";
            
            const Icon = item.icon;
            
            return (
              <li key={i}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gray-100 text-primary shadow-sm translate-x-[-3px]"
                      : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                  }`}
                >
                <Icon 
                  size={22} 
                  className={`transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-gray-500 group-hover:text-primary"
                  }`}
                  strokeWidth={1.5}
                />
                  {!collapsed && <span className="font-medium text-sm whitespace-nowrap truncate">{item.name}</span>}
                  {!collapsed && (
                    <>
                      {item.href === "/admin/providers" && typeof stats?.totalProviders === "number" && (
                        <span className="ml-auto text-xs rounded-lg px-2 py-0.5 bg-primary/10 text-primary">
                          {stats.totalProviders}
                        </span>
                      )}
                      {item.href === "/admin/requesters" && typeof stats?.totalRequesters === "number" && (
                        <span className="ml-auto text-xs rounded-lg px-2 py-0.5 bg-primary/10 text-primary">
                          {stats.totalRequesters}
                        </span>
                      )}
                      {item.href === "/admin/requests" && typeof stats?.totalRequests === "number" && (
                        <span className="ml-auto text-xs rounded-lg px-2 py-0.5 bg-primary/10 text-primary">
                          {stats.totalRequests}
                        </span>
                      )}
                      {item.href === "/admin/projects" && typeof stats?.totalProjects === "number" && (
                        <span className="ml-auto text-xs rounded-lg px-2 py-0.5 bg-primary/10 text-primary">
                          {stats.totalProjects}
                        </span>
                      )}
                      {item.href === "/admin/tickets" && typeof stats?.totalTickets === "number" && (
                        <span className="ml-auto text-xs rounded-lg px-2 py-0.5 bg-primary/10 text-primary">
                          {stats.totalTickets}
                        </span>
                      )}
                    </>
                  )}
                  
                  {isActive && (
                    <div className="mr-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div
        className="info flex items-center gap-3 px-6 py-6 border-t border-gray-200 bg-white"
      >
        <div className="rounded-full w-10 h-10 overflow-hidden border-2 border-gray-200 shadow-sm">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <Link href={"/admin/profile"} className="content text-gray-700 flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{data?.fullName || "Admin User"}</h3>
            <span className="text-xs text-gray-500 block truncate">
              {t("nav.admin")}
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
