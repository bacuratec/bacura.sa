/**
 * Unified params hook that works with both React Router and Next.js
 */
import { useParams as useReactParams } from "react-router-dom";

export function useParams() {
  return useReactParams() || {};
}

