"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Requests = dynamic(() => import("@/pages/admin/requests/Requests"), {
  loading: () => <TablePageSkeleton />,
});

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <Requests />
    </Suspense>
  );
}

