'use client';

import { Suspense } from "react";
import AdminLayout from "@/components/Layouts/admin-layout/AdminLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import HomeAdmin from "@/src/pages/admin/home/Home";

export default function AdminHomePage() {
  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <AdminLayout>
        <Suspense fallback={<LoadingPage />}>
          <HomeAdmin />
        </Suspense>
      </AdminLayout>
    </AuthGuard>
  );
}

