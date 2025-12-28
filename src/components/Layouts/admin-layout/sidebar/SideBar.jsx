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

  const imageUrl = data?.profilePictureUrl
    ? `${getAppBaseUrl()}/${data.profilePictureUrl}`
    : logo;

  return (
    <aside className="min-h-screen fixed w-[260px] bg-primary top-0 right-0 hidden lg:flex flex-col justify-between shadow-2xl z-50">
      <div className="logo p-6 flex justify-center border-b border-white/10">
        <img src={logo} alt="Bacura" className="h-12 w-auto object-contain" />
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
                  className={`group flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-white text-primary shadow-lg translate-x-[-5px]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon 
                    size={22} 
                    className={`transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-white/80 group-hover:text-white"
                    }`}
                    strokeWidth={1.5}
                  />
                  <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                  
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
        className="info flex items-center gap-3 px-6 py-6 bg-black/10 backdrop-blur-sm"
      >
        <div className="rounded-full w-10 h-10 overflow-hidden border-2 border-white/30 shadow-sm">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <Link href={"/admin/profile"} className="content text-white flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{data?.fullName || "Admin User"}</h3>
          <span className="text-xs text-white/60 block truncate">
            {t("nav.admin")}
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default SideBar;
