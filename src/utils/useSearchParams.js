/**
 * Unified search params hook that works with both React Router and Next.js
 */
"use client";

import { useSearchParams as useNextSearchParams } from "next/navigation";

export function useSearchParams() {
  // Always call hooks at the top level - required by React rules
  const searchParams = useNextSearchParams();

  return {
    get: (key) => searchParams?.get(key) || null,
    getAll: (key) => searchParams?.getAll(key) || [],
    has: (key) => searchParams?.has(key) || false,
    toString: () => searchParams?.toString() || "",
  };
}

