'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import RequestService from "@/src/pages/landing/requestService/RequestService";

export default function RequestServicePage() {
  return (
    <AuthGuard allowedRoles={["Requester"]}>
      <MainLayout>
        <Suspense fallback={<LoadingPage />}>
          <RequestService />
        </Suspense>
      </MainLayout>
    </AuthGuard>
  );
}

