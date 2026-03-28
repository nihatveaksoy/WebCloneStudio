"use client"

import { useState } from "react"
import { Wand2, RefreshCw, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { MockModeBanner } from "./MockModeBanner"

export function EnhancedTab({
  project,
  onRefresh,
}: {
  project: Project
  onRefresh: () => void
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isStarting, setIsStarting] = useState(false)
  const { analysis, enhanced } = project

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(analysis.suggestions.map((s) => s.id)))
  }

  function deselectAll() {
    setSelectedIds(new Set())
  }

  async function handleEnhance() {
    if (selectedIds.size === 0) return
    setIsStarting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionIds: Array.from(selectedIds) }),
      })
      if (!res.ok) {
        throw new Error("Failed to start enhancement")
      }
      toast.success("Enhancement started")
      onRefresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start enhancement"
      )
    } finally {
      setIsStarting(false)
    }
  }

  if (analysis.status !== "done") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Analysis Required</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Run the analysis first to get improvement suggestions, then generate
          an enhanced version based on selected improvements.
        </p>
      </div>
    )
  }

  if (enhanced.status === "analyzing" || enhanced.status === "building") {
    return (
      <div className="space-y-6 py-8">
        <div className="text-center">
          <p className="text-sm font-medium mb-1">Generating enhanced version...</p>
          <p className="text-xs text-muted-foreground">
            Applying selected improvements to the cloned website
          </p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (enhanced.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <Wand2 className="size-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Enhancement Failed</h3>
        <p className="text-sm text-destructive mb-6 max-w-sm">
          {enhanced.error ?? "An unknown error occurred during enhancement."}
        </p>
        <Button onClick={handleEnhance} disabled={isStarting} variant="outline">
          <RefreshCw className="size-4" />
          {isStarting ? "Retrying..." : "Retry Enhancement"}
        </Button>
      </div>
    )
  }

  if (enhanced.status === "done") {
    const appliedSuggestions = analysis.suggestions.filter((s) =>
      enhanced.appliedSuggestionIds.includes(s.id)
    )

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-1">Enhancement Complete</h3>
          <p className="text-sm text-muted-foreground">
            {appliedSuggestions.length} improvement
            {appliedSuggestions.length !== 1 ? "s" : ""} applied
          </p>
        </div>

        {/* Applied Improvements List */}
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium mb-3">Applied Improvements</p>
          <ul className="space-y-2">
            {appliedSuggestions.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-2 text-sm"
              >
                <Check className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{s.title}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Original Site */}
        <div className="rounded-lg border overflow-hidden">
          {project.clone.screenshotDesktop && (
            <img
              src={project.clone.screenshotDesktop}
              alt="Original site screenshot"
              className="w-full object-cover max-h-[300px]"
            />
          )}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Original Site</p>
              <p className="text-xs text-muted-foreground">{project.url}</p>
            </div>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Visit Site
              <Sparkles className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  // idle: show suggestion selection
  const suggestions = analysis.suggestions
  const allSelected = selectedIds.size === suggestions.length

  return (
    <div className="space-y-4">
      <MockModeBanner />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Select Improvements</h3>
          <p className="text-xs text-muted-foreground">
            Choose which suggestions to apply in the enhanced version
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? deselectAll : selectAll}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>

      <div className="space-y-2">
        {suggestions.map((s) => {
          const isSelected = selectedIds.has(s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSelection(s.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected && <Check className="size-3" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {s.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleEnhance}
          disabled={selectedIds.size === 0 || isStarting}
          size="lg"
        >
          <Wand2 className="size-4" />
          {isStarting
            ? "Starting..."
            : `Generate Enhanced Version (${selectedIds.size})`}
        </Button>
      </div>
    </div>
  )
}
