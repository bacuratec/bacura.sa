'use client';

import { Suspense } from "react";
import MainLayout from "@/components/Layouts/main-layout/MainLayout";
import AuthGuard from "@/components/authGuard";
import LoadingPage from "@/src/pages/LoadingPage";
import Profile from "@/src/pages/landing/profile/Profile";

export default function ProfilePage() {
  return (
    <AuthGuard allowedRoles={["Requester"]}>
      <MainLayout>
        <Suspense fallback={<LoadingPage />}>
          <Profile />
        </Suspense>
      </MainLayout>
    </AuthGuard>
  );
}

