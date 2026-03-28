"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import type { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Link
          href="/"
          aria-label="Back to dashboard"
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {project.name}
          </h1>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {project.url}
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-11 sm:pl-0">
        <span className="text-xs text-muted-foreground">Clone</span>
        <StatusBadge status={project.clone.status} />
        <span className="text-xs text-muted-foreground ml-2">Analysis</span>
        <StatusBadge status={project.analysis.status} />
        <span className="text-xs text-muted-foreground ml-2">Enhanced</span>
        <StatusBadge status={project.enhanced.status} />
      </div>
    </header>
  )
}
