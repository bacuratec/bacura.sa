'use client';

import { Suspense } from "react";
import DashboardLayout from "@/components/Layouts/dashboard-layout/DashboardLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/pages/LoadingPage";
import OurProjects from "@/pages/provider/our-projects/OurProjects";

export default function OurProjectsPage() {
  return (
    <AuthGuard allowedRoles={["Provider"]}>
      <DashboardLayout>
        <Suspense fallback={<LoadingPage />}>
          <OurProjects />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}

