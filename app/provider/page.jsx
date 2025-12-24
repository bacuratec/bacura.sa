"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const HomeProvider = dynamic(() => import("@/views/provider/home/Home"), {
  loading: () => <DashboardSkeleton />,
});

export default function ProviderHomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <HomeProvider />
    </Suspense>
  );
}

