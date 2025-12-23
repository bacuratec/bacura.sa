'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import Projects from "@/src/pages/landing/projects/Projects";

export default function ProjectsPage() {
  return (
    <AuthGuard allowedRoles={["Requester"]}>
      <MainLayout>
        <Suspense fallback={<LoadingPage />}>
          <Projects />
        </Suspense>
      </MainLayout>
    </AuthGuard>
  );
}

