'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import GuestGuard from "@/components/GuestGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import Login from "@/src/pages/landing/login/Login";

export default function LoginPage() {
  return (
    <MainLayout>
      <GuestGuard>
        <Suspense fallback={<LoadingPage />}>
          <Login />
        </Suspense>
      </GuestGuard>
    </MainLayout>
  );
}

