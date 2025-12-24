/**
 * Unified navigate hook that works with both React Router and Next.js
 */
import { useRouter } from "next/navigation";
import { useNavigate as useReactRouterNavigate } from "react-router-dom";

export function useNavigate() {
  // Try Next.js first
  if (typeof window !== "undefined") {
    try {
      const router = useRouter();
      return (to, options) => {
        if (typeof to === "string") {
          router.push(to);
        } else if (to && typeof to === "object") {
          router.push(to.pathname + (to.search || ""));
        }
      };
    } catch (e) {
      // Fallback to React Router
    }
  }

  // Fallback to React Router
  try {
    return useReactRouterNavigate();
  } catch (e) {
    // Final fallback
    return (to) => {
      if (typeof window !== "undefined") {
        window.location.href = typeof to === "string" ? to : to?.pathname || "/";
      }
    };
  }
}

