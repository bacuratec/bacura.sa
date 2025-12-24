/**
 * Unified search params hook that works with both React Router and Next.js
 */
import { useSearchParams as useNextSearchParams } from "next/navigation";
import { useSearchParams as useReactRouterSearchParams } from "react-router-dom";

export function useSearchParams() {
  // Try Next.js first
  if (typeof window !== "undefined") {
    try {
      const searchParams = useNextSearchParams();
      return {
        get: (key) => searchParams?.get(key) || null,
        getAll: (key) => searchParams?.getAll(key) || [],
        has: (key) => searchParams?.has(key) || false,
        toString: () => searchParams?.toString() || "",
      };
    } catch (e) {
      // Fallback to React Router
    }
  }

  // Fallback to React Router
  try {
    return useReactRouterSearchParams();
  } catch (e) {
    // Final fallback
    return {
      get: () => null,
      getAll: () => [],
      has: () => false,
      toString: () => "",
    };
  }
}

