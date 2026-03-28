"use client"

import { Globe } from "lucide-react"
import { ProjectCard } from "@/components/app/ProjectCard"
import type { Project } from "@/types/project"

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Globe className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">
            No projects yet
          </p>
          <p className="text-sm text-muted-foreground">
            Add your first website to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
