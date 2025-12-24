import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/slices/authSlice";

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

const AuthGuard = ({ allowedRoles, children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      dispatch(logout());
      setShouldRedirect(true);
    }
  }, [token, dispatch]);

  // إذا لم يكن هناك token أو انتهت صلاحيته
  if (shouldRedirect || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // إذا كان المستخدم ليس له الدور المطلوب
  if (!allowedRoles.includes(role)) {
    // توجيه المستخدم إلى لوحة التحكم المناسبة حسب دوره
    let redirectPath = "/login";
    if (role === "Admin") {
      redirectPath = "/admin";
    } else if (role === "Provider") {
      redirectPath = "/provider";
    } else if (role === "Requester") {
      redirectPath = "/";
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default AuthGuard;
