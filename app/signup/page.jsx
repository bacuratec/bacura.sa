"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Signup = dynamic(() => import("@/pages/landing/signup/Signup"), {
  loading: () => <ProfileSkeleton />,
});

export default function SignupPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Signup />
    </Suspense>
  );
}

