import {
  MousePointer,
  Zap,
  Eye,
  Sparkles,
  Palette,
  Search,
  Check,
} from "lucide-react"
import type { Suggestion, SuggestionCategory } from "@/types/project"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const categoryIcons: Record<SuggestionCategory, React.ElementType> = {
  ux: MousePointer,
  performance: Zap,
  accessibility: Eye,
  "modern-patterns": Sparkles,
  design: Palette,
  seo: Search,
}

const categoryLabels: Record<SuggestionCategory, string> = {
  ux: "UX",
  performance: "Performance",
  accessibility: "Accessibility",
  "modern-patterns": "Modern Patterns",
  design: "Design",
  seo: "SEO",
}

const priorityVariant: Record<Suggestion["priority"], "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
}

const effortConfig: Record<Suggestion["effort"], { label: string; className: string }> = {
  easy: { label: "Easy", className: "text-green-600 dark:text-green-400" },
  medium: { label: "Medium", className: "text-yellow-600 dark:text-yellow-400" },
  hard: { label: "Hard", className: "text-red-600 dark:text-red-400" },
}

export function SuggestionCard({
  suggestion,
  onToggleApply,
}: {
  suggestion: Suggestion
  onToggleApply: (id: string) => void
}) {
  const Icon = categoryIcons[suggestion.category]
  const effort = effortConfig[suggestion.effort]

  return (
    <Card
      className={cn(
        "transition-all",
        suggestion.applied && "ring-2 ring-primary/40"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-muted p-1.5">
              <Icon className="size-4" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{categoryLabels[suggestion.category]}</Badge>
              <Badge variant={priorityVariant[suggestion.priority]}>
                {suggestion.priority}
              </Badge>
              <span className={cn("text-xs font-medium", effort.className)}>
                {effort.label}
              </span>
            </div>
          </div>
          <button
            type="button"
            role="checkbox"
            aria-checked={suggestion.applied}
            aria-label={`Mark "${suggestion.title}" as applied`}
            onClick={() => onToggleApply(suggestion.id)}
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
              suggestion.applied
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary"
            )}
          >
            {suggestion.applied && <Check className="size-3" />}
          </button>
        </div>
        <CardTitle className="mt-1">{suggestion.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border bg-muted/30 p-2.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Current
            </p>
            <p className="text-xs">{suggestion.currentState}</p>
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Suggested
            </p>
            <p className="text-xs">{suggestion.suggestedState}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
