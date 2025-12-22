import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const GuestGuard = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);

  if (token) {
    // ✅ نرجع المستخدم حسب الـ role
    if (role === "Admin") return <Navigate to="/admin" replace />;
    if (role === "Provider") return <Navigate to="/provider" replace />;
    if (role === "Requester") return <Navigate to="/" replace />;
  }

  // ✅ لو مفيش توكن نسمح له يشوف الصفحة
  return children;
};

export default GuestGuard;
