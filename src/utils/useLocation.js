/**
 * Unified location hook that works with both React Router and Next.js
 * This allows components to work in both environments
 */
"use client";

import { usePathname } from "next/navigation";

export function useLocation() {
  // Always call hooks at the top level - required by React rules
  const pathname = usePathname() || "/";

  return {
    pathname,
    search: typeof window !== "undefined" ? window.location.search : "",
    hash: typeof window !== "undefined" ? window.location.hash : "",
    state: null,
    key: "",
  };
}

