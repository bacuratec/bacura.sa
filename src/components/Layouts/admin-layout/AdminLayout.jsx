"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileNavigation from "./sidebar/MobileNavigation";
import Header from "./header/Header";
import SideBar from "./sidebar/SideBar";
import { useSelector, useDispatch } from "react-redux";
import { useGetAdminDetailsQuery } from "../../../redux/api/usersDetails";
import { supabase } from "../../../lib/supabaseClient";
import { detectUserRole } from "../../../utils/roleDetection";
import { logoutUser } from "../../../redux/slices/authSlice";
import LoadingPage from "../../../views/LoadingPage";

const AdminLayout = ({ children }) => {
  const userId = useSelector((state) => state.auth.userId);
  const role = useSelector((state) => state.auth.role);
  const dispatch = useDispatch();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const { data: adminData } = useGetAdminDetailsQuery(userId, {
    skip: !userId || !isAdmin,
  });

  useEffect(() => {
    const verifyAdminRole = async () => {
      try {
        // التحقق من Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          dispatch(logoutUser());
          setIsAdmin(false);
          setIsVerifying(false);
          return;
        }

        // التحقق من الدور مباشرة من جدول users في Supabase
        const userRole = await detectUserRole(session.user, session);
        
        // التأكد من أن المستخدم أدمن فقط
        if (userRole === "Admin") {
          setIsAdmin(true);
        } else {
          // إذا لم يكن أدمن، تسجيل الخروج وإعادة التوجيه
          dispatch(logoutUser());
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error verifying admin role:", error);
        dispatch(logoutUser());
        setIsAdmin(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminRole();
  }, [userId, dispatch]);

  // إذا لم يكن أدمن، إعادة التوجيه
  useEffect(() => {
    if (!isVerifying && (!isAdmin || role !== "Admin")) {
      router.replace("/login");
    }
  }, [isVerifying, isAdmin, role, router]);

  if (isVerifying) {
    return <LoadingPage />;
  }

  if (!isAdmin || role !== "Admin") {
    return null;
  }

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
