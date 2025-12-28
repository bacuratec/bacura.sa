/**
 * Unified navigate hook for Next.js App Router
 */
"use client";

import { useRouter } from "next/navigation";

export function useNavigate() {
  const router = useRouter();
  return (to, options = {}) => {
    if (typeof to === "string") {
      options.replace ? router.replace(to) : router.push(to);
    } else if (to && typeof to === "object") {
      const href = to.pathname + (to.search || "");
      options.replace ? router.replace(href) : router.push(href);
    }
  };
}

