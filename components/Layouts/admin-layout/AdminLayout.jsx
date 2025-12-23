'use client';

import MobileNavigation from "@/components/Layouts/admin-layout/sidebar/MobileNavigation";
import Header from "@/components/Layouts/admin-layout/header/Header";
import SideBar from "@/components/Layouts/admin-layout/sidebar/SideBar";
import { useSelector } from "react-redux";
import { useGetAdminDetailsQuery } from "@/redux/api/usersDetails";

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

