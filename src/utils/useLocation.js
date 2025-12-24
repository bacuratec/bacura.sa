/**
 * Unified location hook that works with both React Router and Next.js
 * This allows components to work in both environments
 */
"use client";

import { usePathname } from "next/navigation";
import { useContext } from "react";

// Check if we're in Next.js environment
const isNextJS = typeof window !== "undefined" && window.__NEXT_DATA__;

export function useLocation() {
  // In Next.js, use usePathname
  if (isNextJS) {
    try {
      const pathname = usePathname();
      return {
        pathname: pathname || "/",
        search: typeof window !== "undefined" ? window.location.search : "",
        hash: typeof window !== "undefined" ? window.location.hash : "",
        state: null,
        key: "",
      };
    } catch (e) {
      // Fallback to window.location
    }
  }

  // Try React Router (only if not in Next.js)
  if (!isNextJS) {
    try {
      // Dynamic import to avoid errors if React Router is not available
      const { useLocation: useReactRouterLocation } = require("react-router-dom");
      return useReactRouterLocation();
    } catch (e) {
      // React Router not available
    }
  }

  // Final fallback: use window.location
  if (typeof window !== "undefined") {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: null,
      key: "",
    };
  }

  // Server-side fallback
  return {
    pathname: "/",
    search: "",
    hash: "",
    state: null,
    key: "",
  };
}

