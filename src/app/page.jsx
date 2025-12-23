'use client';

import { Suspense, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { setCredentials, logout } from "@/lib/redux/slices/authSlice";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import LoadingPage from "@/pages/LoadingPage";
import LandingHome from "@/pages/landing/home/Home";
import { LanguageContext } from "@/context/LanguageContext";
import i18n from "@/lib/i18n";
import AuthGuard from "@/components/authGuard";

// Component to handle auth initialization
function AuthInitializer({ children }) {
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
          if (!role || !token) {
            // محاولة جلب الدور من RPC function
            try {
              const { data: userRole, error: rpcError } = await supabase.rpc(
                "get_user_role",
                { user_id: session.user.id }
              );

              if (!rpcError && userRole) {
                const normalizedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();
                dispatch(
                  setCredentials({
                    token: session.access_token,
                    refreshToken: session.refresh_token || null,
                    role: normalizedRole,
                    userId: session.user.id,
                  })
                );
              } else {
                // محاولة جلب الدور من جدول users
                const { data: dbUser, error: dbError } = await supabase
                  .from("users")
                  .select("role, id")
                  .eq("id", session.user.id)
                  .maybeSingle();

                if (!dbError && dbUser?.role) {
                  const normalizedRole = dbUser.role.charAt(0).toUpperCase() + dbUser.role.slice(1).toLowerCase();
                  dispatch(
                    setCredentials({
                      token: session.access_token,
                      refreshToken: session.refresh_token || null,
                      role: normalizedRole,
                      userId: session.user.id,
                    })
                  );
                }
              }
            } catch (err) {
              console.error("Error detecting role:", err);
            }
          }
        } else {
          // لا يوجد session - مسح البيانات
          if (token || role) {
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
          dispatch(logout());
        } else if (event === "SIGNED_IN" && session) {
          // إذا تم تسجيل الدخول، جلب الدور
          try {
            const { data: userRole, error: rpcError } = await supabase.rpc(
              "get_user_role",
              { user_id: session.user.id }
            );

            if (!rpcError && userRole) {
              const normalizedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();
              dispatch(
                setCredentials({
                  token: session.access_token,
                  refreshToken: session.refresh_token || null,
                  role: normalizedRole,
                  userId: session.user.id,
                })
              );
            }
          } catch (err) {
            console.error("Error detecting role on sign in:", err);
          }
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

export default function HomePage() {
  const { lang } = useContext(LanguageContext);
  
  useEffect(() => {
    if (lang && ["en", "ar"].includes(lang)) {
      i18n.changeLanguage(lang);
      document.documentElement.setAttribute(
        "dir",
        lang === "ar" ? "rtl" : "ltr"
      );
      document.documentElement.setAttribute("lang", lang);
    }
  }, [lang]);

  return (
    <div className={lang === "ar" ? "dir-rtl" : "dir-ltr"}>
      <AuthInitializer>
        <AuthGuard allowedRoles={["Requester"]}>
          <MainLayout>
            <Suspense fallback={<LoadingPage />}>
              <LandingHome />
            </Suspense>
          </MainLayout>
        </AuthGuard>
      </AuthInitializer>
    </div>
  );
}

