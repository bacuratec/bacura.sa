import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GuestGuard = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

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

      if (path && pathname !== path) {
        router.replace(path);
        setShouldRedirect(true);
      }
    }
  }, [token, role, pathname, router]);

  if (shouldRedirect) {
    return null; // or loading spinner
  }

  // ✅ لو مفيش توكن نسمح له يشوف الصفحة
  return children;
};

export default GuestGuard;
