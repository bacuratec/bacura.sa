"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Explore = dynamic(() => import("@/views/landing/exploreRequests/Explore"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function RequestsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <Explore />
    </Suspense>
  );
}

