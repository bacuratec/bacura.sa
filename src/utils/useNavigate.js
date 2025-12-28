/**
 * Unified navigate hook that works with both React Router and Next.js
 */
import { useNavigate as useReactNavigate } from "react-router-dom";

export function useNavigate() {
  const navigate = useReactNavigate();
  return (to) => {
    if (typeof to === "string") {
      navigate(to);
    } else if (to && typeof to === "object") {
      navigate(to.pathname + (to.search || ""));
    }
  };
}

