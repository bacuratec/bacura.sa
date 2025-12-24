"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const HomeAdmin = dynamic(() => import("@/pages/admin/home/Home"), {
  loading: () => <DashboardSkeleton />,
});

export default function AdminHomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <HomeAdmin />
    </Suspense>
  );
}

