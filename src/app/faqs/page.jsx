'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import LoadingPage from "@/pages/LoadingPage";
import Faqs from "@/components/landing-components/home-components/faqs/Faqs";

export default function FaqsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <Faqs />
      </Suspense>
    </MainLayout>
  );
}

