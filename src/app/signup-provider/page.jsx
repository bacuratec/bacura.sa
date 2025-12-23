'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import GuestGuard from "@/components/GuestGuard";
import LoadingPage from "@/pages/LoadingPage";
import Signup from "@/pages/landing/signup/Signup";

export default function SignupProviderPage() {
  return (
    <MainLayout>
      <GuestGuard>
        <Suspense fallback={<LoadingPage />}>
          <Signup />
        </Suspense>
      </GuestGuard>
    </MainLayout>
  );
}

