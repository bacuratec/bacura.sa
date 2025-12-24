/**
 * Unified params hook that works with both React Router and Next.js
 */
import { useParams as useNextParams } from "next/navigation";
import { useParams as useReactRouterParams } from "react-router-dom";

export function useParams() {
  // Try Next.js first
  if (typeof window !== "undefined") {
    try {
      return useNextParams();
    } catch (e) {
      // Fallback to React Router
    }
  }

  // Fallback to React Router
  try {
    return useReactRouterParams();
  } catch (e) {
    // Final fallback
    return {};
  }
}

