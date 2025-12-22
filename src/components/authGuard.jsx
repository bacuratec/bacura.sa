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
      setShouldRedirect(true); // يخلي الري أكت ترجع تعمل render ويفعل التنقل
    }
  }, [token, dispatch]);

  if (shouldRedirect || !token) {
    if (
      allowedRoles.includes("Requester") &&
      !location.pathname.includes("profile") &&
      !location.pathname.includes("request-service") &&
      !location.pathname.includes("requests") &&
      !location.pathname.includes("request") &&
      !location.pathname.includes("projects")
    ) {
      return children;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;
