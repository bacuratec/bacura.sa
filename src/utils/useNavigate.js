/**
 * Unified navigate hook that works with both React Router and Next.js
 */
"use client";

import { useRouter } from "next/navigation";

export function useNavigate() {
  // Always call hooks at the top level - required by React rules
  const router = useRouter();

  return (to, _options) => {
    if (typeof to === "string") {
      router.push(to);
    } else if (to && typeof to === "object") {
      router.push(to.pathname + (to.search || ""));
    }
  };
}

