import { Outlet } from "react-router-dom";
import MobileNavigation from "./sidebar/MobileNavigation";
import Header from "./header/Header";
import SideBar from "./sidebar/SideBar";
import { useSelector } from "react-redux";
import { useGetAdminDetailsQuery } from "../../../redux/api/usersDetails";

const AdminLayout = () => {
  const userId = useSelector((state) => state.auth.userId);

  const { data: adminData } = useGetAdminDetailsQuery(userId);
  return (
    <div>
      <MobileNavigation />
      <Header data={adminData} />
      <SideBar data={adminData} />
      <main className="lg:mr-[250px] min-h-screen mb-10 lg:mb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
