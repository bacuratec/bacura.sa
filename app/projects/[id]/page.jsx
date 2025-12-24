"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DetailPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ProjectUserDetails = dynamic(() => import("@/views/landing/project-details/ProjectUserDetails"), {
  loading: () => <DetailPageSkeleton />,
});

export default function ProjectDetailsPage({ params: _params }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <ProjectUserDetails />
    </Suspense>
  );
}

