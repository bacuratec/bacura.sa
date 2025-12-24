import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import MobileNavigation from "./sidebar/MobileNavigation";
import Header from "./header/Header";
import SideBar from "./sidebar/SideBar";
import { useSelector, useDispatch } from "react-redux";
import { useGetProviderDetailsQuery } from "../../../redux/api/usersDetails";
import { supabase } from "../../../lib/supabaseClient";
import { detectUserRole } from "../../../utils/roleDetection";
import { logoutUser } from "../../../redux/slices/authSlice";
import LoadingPage from "../../../pages/LoadingPage";

const DashboardLayout = () => {
  const userId = useSelector((state) => state.auth.userId);
  const role = useSelector((state) => state.auth.role);
  const dispatch = useDispatch();
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
          dispatch(logoutUser());
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
          // إذا لم يكن Provider، تسجيل الخروج وإعادة التوجيه
          dispatch(logoutUser());
          setIsProvider(false);
        }
      } catch (error) {
        console.error("Error verifying provider role:", error);
        dispatch(logoutUser());
        setIsProvider(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyProviderRole();
  }, [userId, dispatch]);

  // عرض صفحة التحميل أثناء التحقق
  if (isVerifying) {
    return <LoadingPage />;
  }

  // إذا لم يكن Provider، إعادة التوجيه
  if (!isProvider || role !== "Provider") {
    return <Navigate to="/login" replace />;
  }

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
