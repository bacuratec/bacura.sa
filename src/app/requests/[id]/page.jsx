'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/pages/LoadingPage";
import UserRequestDetails from "@/pages/landing/request-details/RequestDetails";

export default function RequestDetailsPage({ params }) {
  return (
    <AuthGuard allowedRoles={["Requester"]}>
      <MainLayout>
        <Suspense fallback={<LoadingPage />}>
          <UserRequestDetails />
        </Suspense>
      </MainLayout>
    </AuthGuard>
  );
}

