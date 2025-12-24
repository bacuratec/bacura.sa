"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const OurRates = dynamic(() => import("@/pages/provider/our-rates/OurRates"), {
  loading: () => <ProfileSkeleton />,
});

export default function OurRatesPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <OurRates />
    </Suspense>
  );
}

