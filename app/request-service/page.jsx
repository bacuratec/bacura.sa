"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const RequestService = dynamic(() => import("@/views/landing/requestService/RequestService"), {
  loading: () => <ProfileSkeleton />,
  ssr: false,
});

export default function RequestServicePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <RequestService />
    </Suspense>
  );
}

