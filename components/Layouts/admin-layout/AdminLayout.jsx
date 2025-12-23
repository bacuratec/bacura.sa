'use client';

import MobileNavigation from "./sidebar/MobileNavigation";
import Header from "./header/Header";
import SideBar from "./sidebar/SideBar";
import { useSelector } from "react-redux";
import { useGetAdminDetailsQuery } from "@/src/redux/api/usersDetails";

const AdminLayout = ({ children }) => {
  const userId = useSelector((state) => state.auth.userId);

  const { data: adminData } = useGetAdminDetailsQuery(userId);
  return (
    <div>
      <MobileNavigation />
      <Header data={adminData} />
      <SideBar data={adminData} />
      <main className="lg:mr-[250px] min-h-screen mb-10 lg:mb-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

