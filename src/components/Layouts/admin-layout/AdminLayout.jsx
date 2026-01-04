'use client';

import MobileNavigation from "@/components/Layouts/admin-layout/sidebar/MobileNavigation";
import Header from "@/components/Layouts/admin-layout/header/Header";
import SideBar from "@/components/Layouts/admin-layout/sidebar/SideBar";
import { useSelector } from "react-redux";
import { useGetAdminByUserIdQuery } from "@/redux/api/usersDetails";

const AdminLayout = ({ children }) => {
  const userId = useSelector((state) => state.auth.userId);

  const { data: adminDataResult } = useGetAdminByUserIdQuery(userId, { skip: !userId });
  const adminData = Array.isArray(adminDataResult) ? adminDataResult[0] : adminDataResult;

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

