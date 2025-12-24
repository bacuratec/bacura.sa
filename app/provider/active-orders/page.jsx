"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ActiveOrders = dynamic(() => import("@/pages/provider/active-orders/ActiveOrders"), {
  loading: () => <TablePageSkeleton />,
});

export default function ActiveOrdersPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <ActiveOrders />
    </Suspense>
  );
}

