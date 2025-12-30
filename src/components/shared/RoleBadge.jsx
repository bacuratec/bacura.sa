import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import Link from "next/link";
import { useEffect, useState } from "react";

const RoleBadge = () => {
  const dispatch = useDispatch();
  const { role, token, refreshToken, userId } = useSelector((s) => s.auth);
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    try {
      const v = typeof localStorage !== "undefined" ? localStorage.getItem("ROLE_DEBUG") === "1" : false;
      setDebug(v);
    } catch (e) {
      void e;
    }
  }, []);
  const setRole = (r) => {
    dispatch(
      setCredentials({
        token,
        refreshToken,
        role: r,
        userId,
      })
    );
  };
  const items =
    role === "Admin"
      ? [
          { href: "/admin/services", label: "Services" },
          { href: "/admin/requests", label: "Requests" },
          { href: "/admin/projects", label: "Projects" },
        ]
      : role === "Provider"
      ? [
          { href: "/provider", label: "Home" },
          { href: "/provider/active-orders", label: "Orders" },
          { href: "/provider/our-projects", label: "Projects" },
        ]
      : [
          { href: "/profile", label: "Profile" },
          { href: "/requests", label: "Requests" },
          { href: "/projects", label: "Projects" },
        ];
  return (
    <div className="flex items-center gap-2">
      <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-700">{role || "Guest"}</span>
      <div className="flex items-center gap-1">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="px-2 py-1 text-xs rounded bg-primary text-white">
            {it.label}
          </Link>
        ))}
      </div>
      {debug && (
        <select
          value={role || ""}
          onChange={(e) => setRole(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="">Guest</option>
          <option value="Admin">Admin</option>
          <option value="Provider">Provider</option>
          <option value="Requester">Requester</option>
        </select>
      )}
    </div>
  );
};

export default RoleBadge;
