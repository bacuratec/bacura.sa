'use client';

import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GuestGuard = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
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

      if (path && pathname !== path) {
        setRedirectPath(path);
        setShouldRedirect(true);
      }
    }
  }, [token, role, pathname]);

  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      router.replace(redirectPath);
    }
  }, [shouldRedirect, redirectPath, router]);

  // ✅ لو مفيش توكن نسمح له يشوف الصفحة
  return children;
};

export default GuestGuard;

