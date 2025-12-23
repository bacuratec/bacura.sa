'use client';

import { Suspense } from "react";
import DashboardLayout from "@/components/Layouts/dashboard-layout/DashboardLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/pages/LoadingPage";
import OurRates from "@/pages/provider/our-rates/OurRates";

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

