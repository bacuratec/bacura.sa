"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Login = dynamic(() => import("@/views/landing/login/Login"), {
  loading: () => <ProfileSkeleton />,
});

export default function LoginPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Login />
    </Suspense>
  );
}

