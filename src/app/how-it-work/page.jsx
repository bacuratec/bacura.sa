'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import LoadingPage from "@/src/pages/LoadingPage";
import HowItWork from "@/src/pages/landing/howItWork/HowItWork";

export default function HowItWorkPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <HowItWork />
      </Suspense>
    </MainLayout>
  );
}

