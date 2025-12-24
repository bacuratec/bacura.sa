"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DetailPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ProjectsAdminDetails = dynamic(() => import("@/pages/admin/project-details/ProjectsAdminDetails"), {
  loading: () => <DetailPageSkeleton />,
});

export default function AdminProjectDetailsPage({ params }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <ProjectsAdminDetails />
    </Suspense>
  );
}

