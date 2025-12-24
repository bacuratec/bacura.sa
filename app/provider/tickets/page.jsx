"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const TicketsPage = dynamic(() => import("@/views/admin/tickets/Tickets"), {
  loading: () => <TablePageSkeleton />,
});

export default function ProviderTicketsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <TicketsPage />
    </Suspense>
  );
}

