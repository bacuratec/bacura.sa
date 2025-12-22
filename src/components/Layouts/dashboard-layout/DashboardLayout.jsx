import { Outlet } from "react-router-dom";
import MobileNavigation from "./sidebar/MobileNavigation";
import Header from "./header/Header";
import SideBar from "./sidebar/SideBar";
import { useSelector } from "react-redux";
import { useGetProviderDetailsQuery } from "../../../redux/api/usersDetails";

const DashboardLayout = () => {
  const userId = useSelector((state) => state.auth.userId);

  const { data: providerData } = useGetProviderDetailsQuery(userId);
  return (
    <div>
      <MobileNavigation />
      <Header data={providerData} />
      <SideBar data={providerData} />
      <main className="lg:mr-[250px] min-h-screen mb-10 lg:mb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
