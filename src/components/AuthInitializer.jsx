"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { setCredentials, logout } from "@/redux/slices/authSlice";
import { detectUserRole } from "@/utils/roleDetection";
import LoadingPage from "@/views/LoadingPage";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Safety timeout to prevent infinite loading (8 seconds)
    const timeoutId = setTimeout(() => {
      setIsInitializing(false);
    }, 8000);

    const initializeAuth = async () => {
      if (!supabase) {
        console.warn("Supabase client not initialized.");
        setIsInitializing(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setIsInitializing(false);
          return;
        }

        if (session?.user) {
          if (!role || !token) {
            try {
              const userRole = await detectUserRole(session.user, session);
              if (userRole) {
                dispatch(setCredentials({
                  token: session.access_token,
                  refreshToken: session.refresh_token || null,
                  role: userRole,
                  userId: session.user.id,
                }));
              }
            } catch (err) {
              console.error("Error detecting role:", err);
            }
          }
        } else {
          if (token || role) {
            dispatch(logout());
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setIsInitializing(false);
        initialized.current = true;
      }
    };

    if (!initialized.current) {
      initializeAuth();
    } else {
      setIsInitializing(false);
    }

    let subscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          dispatch(logout());
        } else if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
          try {
            const userRole = await detectUserRole(session.user, session);
            if (userRole) {
              dispatch(setCredentials({
                token: session.access_token,
                refreshToken: session.refresh_token || null,
                role: userRole,
                userId: session.user.id,
              }));
            }
          } catch (err) {
            console.error("Auth change role error:", err);
          }
        }
      });
      subscription = data.subscription;
    }

    return () => {
      clearTimeout(timeoutId);
      if (subscription) subscription.unsubscribe();
    };
  }, [dispatch, token, role]);

  if (isInitializing) {
    return <LoadingPage />;
  }

  return children;
}
