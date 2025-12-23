import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const GuestGuard = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    if (token && role) {
      // تحديد مسار التوجيه حسب الدور
      let path = null;
      if (role === "Admin") {
        path = "/admin";
      } else if (role === "Provider") {
        path = "/provider";
      } else if (role === "Requester") {
        path = "/";
      }

      if (path && location.pathname !== path) {
        setRedirectPath(path);
        setShouldRedirect(true);
      }
    }
  }, [token, role, location.pathname]);

  if (shouldRedirect && redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // ✅ لو مفيش توكن نسمح له يشوف الصفحة
  return children;
};

export default GuestGuard;
