"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import LoadingPage from "@/pages/LoadingPage";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const LandingHome = dynamic(() => import("@/pages/landing/home/Home"), {
  loading: () => <DashboardSkeleton />,
});

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <LandingHome />
    </Suspense>
  );
}

