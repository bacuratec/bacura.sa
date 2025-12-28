"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { setCredentials, logoutUser, logout } from "@/redux/slices/authSlice";
import { detectUserRole } from "@/utils/roleDetection";
import LoadingPage from "@/views/LoadingPage";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // التحقق من Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsInitializing(false);
          return;
        }

        if (session && session.user) {
          // إذا كان هناك session لكن لا يوجد role في Redux
          // أو إذا كنا نريد تحديث الـ role دائماً
          if (!role || !token) {
            try {
              const userRole = await detectUserRole(session.user, session);
              
              if (userRole) {
                dispatch(
                  setCredentials({
                    token: session.access_token,
                    refreshToken: session.refresh_token || null,
                    role: userRole,
                    userId: session.user.id,
                  })
                );
              }
            } catch (err) {
              console.error("Error detecting role:", err);
            }
          }
        } else {
          // لا يوجد session - مسح البيانات
          if (token || role) {
            // هنا نستخدم logout مباشرة لأننا تأكدنا من عدم وجود جلسة
            dispatch(logout());
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // الاستماع لتغييرات auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          // عند تسجيل الخروج، نقوم بمسح البيانات من Redux فقط
          // لا نستدعي logoutUser لأنه يحاول عمل signOut مرة أخرى
          dispatch(logout());
        } else if (event === "SIGNED_IN" && session) {
          // إذا تم تسجيل الدخول، جلب الدور
          try {
            const userRole = await detectUserRole(session.user, session);
            
            if (userRole) {
              dispatch(
                setCredentials({
                  token: session.access_token,
                  refreshToken: session.refresh_token || null,
                  role: userRole,
                  userId: session.user.id,
                })
              );
            }
          } catch (err) {
            console.error("Error detecting role on sign in:", err);
          }
        } else if (event === "TOKEN_REFRESHED" && session) {
             // تحديث التوكن في الستيت
             dispatch(
                setCredentials({
                  token: session.access_token,
                  refreshToken: session.refresh_token || null,
                  role: role, // Keep existing role or re-fetch if needed
                  userId: session.user.id,
                })
              );
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, token, role]);

  if (isInitializing) {
    return <LoadingPage />;
  }

  return children;
}
