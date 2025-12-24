"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ProfileDetails = dynamic(() => import("@/pages/admin/profile-details/ProfileDetails"), {
  loading: () => <ProfileSkeleton />,
});

export default function ProviderProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileDetails />
    </Suspense>
  );
}

