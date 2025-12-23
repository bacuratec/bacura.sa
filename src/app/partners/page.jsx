'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import LoadingPage from "@/src/pages/LoadingPage";
import Partners from "@/src/components/landing-components/home-components/partners/Partners";

export default function PartnersPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <Partners />
      </Suspense>
    </MainLayout>
  );
}

