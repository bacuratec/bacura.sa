'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import GuestGuard from "@/components/GuestGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import Signup from "@/src/pages/landing/signup/Signup";

export default function SignupPage() {
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

