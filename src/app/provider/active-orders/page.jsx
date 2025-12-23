'use client';

import { Suspense } from "react";
import DashboardLayout from "@/components/Layouts/dashboard-layout/DashboardLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/pages/LoadingPage";
import ActiveOrders from "@/pages/provider/active-orders/ActiveOrders";

export default function ActiveOrdersPage() {
  return (
    <AuthGuard allowedRoles={["Provider"]}>
      <DashboardLayout>
        <Suspense fallback={<LoadingPage />}>
          <ActiveOrders />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}

