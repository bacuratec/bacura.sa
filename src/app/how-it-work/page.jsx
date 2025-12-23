'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import LoadingPage from "@/pages/LoadingPage";
import HowItWork from "@/pages/landing/howItWork/HowItWork";

export default function HowItWorkPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <HowItWork />
      </Suspense>
    </MainLayout>
  );
}

