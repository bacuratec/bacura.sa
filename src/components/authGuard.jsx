import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logoutUser, setCredentials } from "../redux/slices/authSlice";
import { supabase } from "../lib/supabaseClient";
import { detectUserRole } from "../utils/roleDetection";
import LoadingPage from "../pages/LoadingPage";

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

const AuthGuard = ({ allowedRoles, children }) => {
  const { token, role, userId } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedRole, setVerifiedRole] = useState(null);

  useEffect(() => {
    const verifyRole = async () => {
      if (!token || isTokenExpired(token)) {
        dispatch(logoutUser());
        setShouldRedirect(true);
        setIsVerifying(false);
        return;
      }

      try {
        // التحقق من Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          dispatch(logoutUser());
          setShouldRedirect(true);
          setIsVerifying(false);
          return;
        }

        // التحقق من الدور مباشرة من جدول users في Supabase
        const userRole = await detectUserRole(session.user, session);
        
        if (!userRole) {
          dispatch(logoutUser());
          setShouldRedirect(true);
          setIsVerifying(false);
          return;
        }

        // تحديث Redux إذا تغير الدور
        if (userRole !== role) {
          dispatch(
            setCredentials({
              token: session.access_token,
              refreshToken: session.refresh_token || null,
              role: userRole,
              userId: session.user.id,
            })
          );
        }

        setVerifiedRole(userRole);
      } catch (error) {
        console.error("Error verifying role:", error);
        dispatch(logoutUser());
        setShouldRedirect(true);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyRole();
  }, [token, dispatch, role, userId]);

  // عرض صفحة التحميل أثناء التحقق
  if (isVerifying) {
    return <LoadingPage />;
  }

  // Handle redirects in useEffect or checking state
  const currentRole = verifiedRole || role;

  if (shouldRedirect || !token) {
    if (typeof window !== 'undefined') router.replace(`/login?from=${pathname}`);
    return null;
  }

  if (!allowedRoles.includes(currentRole)) {
    let redirectPath = "/login";
    if (currentRole === "Admin") {
      redirectPath = "/admin";
    } else if (currentRole === "Provider") {
      redirectPath = "/provider";
    } else if (currentRole === "Requester") {
      redirectPath = "/";
    }
    if (typeof window !== 'undefined') router.replace(redirectPath);
    return null;
  }

  return children;
};

export default AuthGuard;
