'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import LoadingPage from "@/src/pages/LoadingPage";
import OurServices from "@/src/pages/landing/our-services/OurServices";

export default function OurServicesPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <OurServices />
      </Suspense>
    </MainLayout>
  );
}

