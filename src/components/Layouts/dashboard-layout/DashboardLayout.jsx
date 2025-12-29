"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileNavigation from "./sidebar/MobileNavigation";
import Header from "./header/Header";
import SideBar from "./sidebar/SideBar";
import { useSelector, useDispatch } from "react-redux";
import { useGetProviderDetailsQuery } from "../../../redux/api/usersDetails";
import { supabase } from "../../../lib/supabaseClient";
import { detectUserRole } from "../../../utils/roleDetection";
import { logout } from "../../../redux/slices/authSlice";
import LoadingPage from "../../../views/LoadingPage";
import { safeReplace } from "../../../utils/safeNavigate";

const DashboardLayout = ({ children }) => {
  const userId = useSelector((state) => state.auth.userId);
  const role = useSelector((state) => state.auth.role);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isProvider, setIsProvider] = useState(false);

  const { data: providerData } = useGetProviderDetailsQuery(userId, {
    skip: !userId || !isProvider,
  });

  useEffect(() => {
    const verifyProviderRole = async () => {
      try {
        // التحقق من Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          dispatch(logout());
          setIsProvider(false);
          setIsVerifying(false);
          return;
        }

        // التحقق من الدور مباشرة من جدول users في Supabase
        const userRole = await detectUserRole(session.user, session);
        
        // التأكد من أن المستخدم Provider فقط
        if (userRole === "Provider") {
          setIsProvider(true);
        } else {
          dispatch(logout());
          setIsProvider(false);
        }
      } catch (error) {
        console.error("Error verifying provider role:", error);
        dispatch(logout());
        setIsProvider(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyProviderRole();
  }, [userId, dispatch]);

  useEffect(() => {
    if (!isVerifying && (!isProvider || role !== "Provider")) {
      safeReplace(router, "/login");
    }
  }, [isVerifying, isProvider, role, router]);

  if (isVerifying) {
    return <LoadingPage />;
  }

  if (!isProvider || role !== "Provider") return null;

  return (
    <div>
      <MobileNavigation />
      <Header data={providerData} />
      <SideBar data={providerData} />
      <main className="lg:mr-[250px] min-h-screen mb-10 lg:mb-0">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
