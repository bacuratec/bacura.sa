"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Explore = dynamic(() => import("@/pages/landing/exploreRequests/Explore"), {
  loading: () => <TablePageSkeleton />,
});

export default function RequestsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <Explore />
    </Suspense>
  );
}

