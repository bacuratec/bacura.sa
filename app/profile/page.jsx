"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Profile = dynamic(() => import("@/pages/landing/profile/Profile"), {
  loading: () => <ProfileSkeleton />,
});

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile />
    </Suspense>
  );
}

