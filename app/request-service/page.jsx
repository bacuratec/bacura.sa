"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const RequestService = dynamic(() => import("@/pages/landing/requestService/RequestService"), {
  loading: () => <ProfileSkeleton />,
});

export default function RequestServicePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <RequestService />
    </Suspense>
  );
}

