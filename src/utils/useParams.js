/**
 * Unified params hook that works with both React Router and Next.js
 */
"use client";

import { useParams as useNextParams } from "next/navigation";

export function useParams() {
  // Always call hooks at the top level - required by React rules
  return useNextParams() || {};
}

