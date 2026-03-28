"use client"

import { useState } from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Project, SuggestionCategory } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { SuggestionCard } from "./SuggestionCard"
import { MockModeBanner } from "./MockModeBanner"

const allCategories: SuggestionCategory[] = [
  "ux",
  "performance",
  "accessibility",
  "modern-patterns",
  "design",
  "seo",
]

const categoryLabels: Record<SuggestionCategory, string> = {
  ux: "UX",
  performance: "Performance",
  accessibility: "Accessibility",
  "modern-patterns": "Modern Patterns",
  design: "Design",
  seo: "SEO",
}

function SkeletonCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SuggestionsTab({
  project,
  onRefresh,
}: {
  project: Project
  onRefresh: () => void
}) {
  const [isStarting, setIsStarting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<SuggestionCategory | null>(null)
  const { analysis } = project

  async function handleAnalyze() {
    setIsStarting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/analyze`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to start analysis")
      }
      toast.success("Analysis started")
      onRefresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start analysis"
      )
    } finally {
      setIsStarting(false)
    }
  }

  function handleToggleApply(id: string) {
    // Toggle is handled locally for UI; actual persistence happens in EnhancedTab
    // This is a no-op for now since suggestions are read from server state
    void id
  }

  if (analysis.status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Analyze Website</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Run AI analysis to get improvement suggestions for UX, performance,
          accessibility, and more.
        </p>
        <Button onClick={handleAnalyze} disabled={isStarting} size="lg">
          <Sparkles className="size-4" />
          {isStarting ? "Starting..." : "Analyze Website"}
        </Button>
      </div>
    )
  }

  if (analysis.status === "analyzing" || analysis.status === "building") {
    return (
      <div className="space-y-6 py-8">
        <div className="text-center">
          <p className="text-sm font-medium mb-1">Analyzing website...</p>
          <p className="text-xs text-muted-foreground">
            AI is reviewing the cloned website for improvement opportunities
          </p>
        </div>
        <SkeletonCards />
      </div>
    )
  }

  if (analysis.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <Sparkles className="size-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Analysis Failed</h3>
        <p className="text-sm text-destructive mb-6 max-w-sm">
          {analysis.error ?? "An unknown error occurred during analysis."}
        </p>
        <Button onClick={handleAnalyze} disabled={isStarting} variant="outline">
          <RefreshCw className="size-4" />
          {isStarting ? "Retrying..." : "Retry Analysis"}
        </Button>
      </div>
    )
  }

  const suggestions = analysis.suggestions
  const filtered = activeFilter
    ? suggestions.filter((s) => s.category === activeFilter)
    : suggestions

  const highCount = suggestions.filter((s) => s.priority === "high").length
  const mediumCount = suggestions.filter((s) => s.priority === "medium").length
  const lowCount = suggestions.filter((s) => s.priority === "low").length

  return (
    <div className="space-y-4">
      <MockModeBanner />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">Priority:</span>
        <Badge variant="destructive">{highCount} High</Badge>
        <Badge variant="default">{mediumCount} Medium</Badge>
        <Badge variant="secondary">{lowCount} Low</Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeFilter === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted"
          )}
        >
          All ({suggestions.length})
        </button>
        {allCategories.map((cat) => {
          const count = suggestions.filter((s) => s.category === cat).length
          if (count === 0) return null
          return (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setActiveFilter(activeFilter === cat ? null : cat)
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeFilter === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              )}
            >
              {categoryLabels[cat]} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onToggleApply={handleToggleApply}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No suggestions found for this category.
        </p>
      )}
    </div>
  )
}
