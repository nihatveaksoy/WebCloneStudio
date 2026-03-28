"use client"

import { Copy, Sparkles, Wand2 } from "lucide-react"
import type { Project } from "@/types/project"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CloneTab } from "./CloneTab"
import { SuggestionsTab } from "./SuggestionsTab"
import { EnhancedTab } from "./EnhancedTab"

function StatusDot({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-primary" />
    </span>
  )
}

function SuggestionCount({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
      {count}
    </span>
  )
}

export function ProjectTabs({
  project,
  onRefresh,
}: {
  project: Project
  onRefresh: () => void
}) {
  const cloneActive =
    project.clone.status === "analyzing" || project.clone.status === "building"
  const analysisActive =
    project.analysis.status === "analyzing" ||
    project.analysis.status === "building"
  const enhancedActive =
    project.enhanced.status === "analyzing" ||
    project.enhanced.status === "building"

  return (
    <Tabs defaultValue="clone">
      <TabsList className={cn("w-full sm:w-auto")}>
        <TabsTrigger value="clone" className="gap-1.5">
          <Copy className="size-4" />
          Clone
          <StatusDot active={cloneActive} />
        </TabsTrigger>
        <TabsTrigger value="suggestions" className="gap-1.5">
          <Sparkles className="size-4" />
          Suggestions
          <StatusDot active={analysisActive} />
          <SuggestionCount count={project.analysis.suggestions.length} />
        </TabsTrigger>
        <TabsTrigger value="enhanced" className="gap-1.5">
          <Wand2 className="size-4" />
          Enhanced
          <StatusDot active={enhancedActive} />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="clone">
        <CloneTab project={project} onRefresh={onRefresh} />
      </TabsContent>
      <TabsContent value="suggestions">
        <SuggestionsTab project={project} onRefresh={onRefresh} />
      </TabsContent>
      <TabsContent value="enhanced">
        <EnhancedTab project={project} onRefresh={onRefresh} />
      </TabsContent>
    </Tabs>
  )
}
