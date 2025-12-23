'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/pages/LoadingPage";
import Explore from "@/pages/landing/exploreRequests/Explore";

export default function RequestsPage() {
  return (
    <AuthGuard allowedRoles={["Requester"]}>
      <MainLayout>
        <Suspense fallback={<LoadingPage />}>
          <Explore />
        </Suspense>
      </MainLayout>
    </AuthGuard>
  );
}

