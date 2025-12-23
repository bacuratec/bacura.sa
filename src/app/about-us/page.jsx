'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import LoadingPage from "@/pages/LoadingPage";
import AboutUs from "@/pages/landing/about-us/AboutUs";

export default function AboutUsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <AboutUs />
      </Suspense>
    </MainLayout>
  );
}

