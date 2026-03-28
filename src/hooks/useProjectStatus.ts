"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Project } from "@/types/project"

const POLL_INTERVAL_MS = 2000

function isActive(project: Project): boolean {
  const statuses = [
    project.clone.status,
    project.analysis.status,
    project.enhanced.status,
  ]
  return statuses.some((s) => s === "analyzing" || s === "building")
}

export function useProjectStatus(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setProject(null)
          setError("Project not found")
          setIsLoading(false)
          return
        }
        throw new Error(`Failed to fetch project: ${res.status}`)
      }
      const json = await res.json()
      const data: Project = json.data ?? json
      setProject(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  const refresh = useCallback(() => {
    void fetchProject()
  }, [fetchProject])

  useEffect(() => {
    void fetchProject()
  }, [fetchProject])

  useEffect(() => {
    if (!project || !isActive(project)) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    function poll() {
      timerRef.current = setTimeout(async () => {
        await fetchProject()
        poll()
      }, POLL_INTERVAL_MS)
    }

    poll()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [project, fetchProject])

  return { project, isLoading, error, refresh }
}
