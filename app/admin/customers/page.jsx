"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const CustomersAdmin = dynamic(() => import("@/pages/admin/customers/Customers"), {
  loading: () => <TablePageSkeleton />,
});

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <CustomersAdmin />
    </Suspense>
  );
}

