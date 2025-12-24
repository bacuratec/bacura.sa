"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const OurProjects = dynamic(() => import("@/pages/provider/our-projects/OurProjects"), {
  loading: () => <TablePageSkeleton />,
});

export default function OurProjectsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <OurProjects />
    </Suspense>
  );
}

