'use client';

import { Suspense } from "react";
import DashboardLayout from "@/components/Layouts/dashboard-layout/DashboardLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/pages/LoadingPage";
import HomeProvider from "@/pages/provider/home/Home";

export default function ProviderHomePage() {
  return (
    <AuthGuard allowedRoles={["Provider"]}>
      <DashboardLayout>
        <Suspense fallback={<LoadingPage />}>
          <HomeProvider />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}

