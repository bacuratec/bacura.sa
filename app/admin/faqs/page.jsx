"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const FaqsAdmin = dynamic(() => import("@/pages/admin/faqs/Faqs"), {
  loading: () => <TablePageSkeleton />,
});

export default function AdminFaqsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <FaqsAdmin />
    </Suspense>
  );
}

