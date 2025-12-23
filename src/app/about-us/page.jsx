'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import LoadingPage from "@/src/pages/LoadingPage";
import AboutUs from "@/src/pages/landing/about-us/AboutUs";

export default function AboutUsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <AboutUs />
      </Suspense>
    </MainLayout>
  );
}

