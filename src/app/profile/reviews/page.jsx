'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import Reviews from "@/src/pages/landing/reviws/Reviews";

export default function ReviewsPage() {
  return (
    <AuthGuard allowedRoles={["Requester"]}>
      <MainLayout>
        <Suspense fallback={<LoadingPage />}>
          <Reviews />
        </Suspense>
      </MainLayout>
    </AuthGuard>
  );
}

