'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import ProjectUserDetails from "@/src/pages/landing/project-details/ProjectUserDetails";

export default function ProjectDetailsPage({ params }) {
  return (
    <AuthGuard allowedRoles={["Requester"]}>
      <MainLayout>
        <Suspense fallback={<LoadingPage />}>
          <ProjectUserDetails />
        </Suspense>
      </MainLayout>
    </AuthGuard>
  );
}

