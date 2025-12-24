"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Projects = dynamic(() => import("@/views/landing/projects/Projects"), {
  loading: () => <TablePageSkeleton />,
});

export default function ProjectsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <Projects />
    </Suspense>
  );
}

