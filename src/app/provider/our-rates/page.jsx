'use client';

import { Suspense } from "react";
import DashboardLayout from "@/components/Layouts/dashboard-layout/DashboardLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import OurRates from "@/src/pages/provider/our-rates/OurRates";

export default function OurRatesPage() {
  return (
    <AuthGuard allowedRoles={["Provider"]}>
      <DashboardLayout>
        <Suspense fallback={<LoadingPage />}>
          <OurRates />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}

