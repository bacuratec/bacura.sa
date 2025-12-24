"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ServicesPage = dynamic(() => import("@/pages/admin/services/Services"), {
  loading: () => <TablePageSkeleton />,
});

export default function AdminServicesPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <ServicesPage />
    </Suspense>
  );
}

