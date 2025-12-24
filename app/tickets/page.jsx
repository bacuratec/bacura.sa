"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Tickets = dynamic(() => import("@/pages/landing/tickets/Tickets"), {
  loading: () => <TablePageSkeleton />,
});

export default function TicketsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <Tickets />
    </Suspense>
  );
}

