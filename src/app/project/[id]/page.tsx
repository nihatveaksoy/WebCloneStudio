"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useProjectStatus } from "@/hooks/useProjectStatus"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProjectHeader } from "@/components/project/ProjectHeader"
import { ProjectTabs } from "@/components/project/ProjectTabs"

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
      <p className="text-sm text-muted-foreground mb-6">
        The project you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { project, isLoading, error, refresh } = useProjectStatus(id)

  return (
    <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-white/80 backdrop-blur-sm" />
      {isLoading ? (
        <LoadingSkeleton />
      ) : error && !project ? (
        <NotFound />
      ) : project ? (
        <div className="space-y-6">
          <ProjectHeader project={project} />
          <ProjectTabs project={project} onRefresh={refresh} />
        </div>
      ) : (
        <NotFound />
      )}
    </main>
  )
}
