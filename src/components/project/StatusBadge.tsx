import type { PipelineStatus } from "@/types/project"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  PipelineStatus,
  { variant: "secondary" | "default" | "outline" | "destructive"; label: string; pulse?: boolean; className?: string }
> = {
  idle: { variant: "secondary", label: "Ready" },
  analyzing: { variant: "default", label: "Analyzing...", pulse: true },
  building: { variant: "default", label: "Building...", pulse: true },
  done: { variant: "outline", label: "Complete", className: "text-green-600 border-green-300 dark:text-green-400 dark:border-green-700" },
  error: { variant: "destructive", label: "Error" },
}

export function StatusBadge({ status }: { status: PipelineStatus }) {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(config.pulse && "animate-pulse", config.className)}
    >
      {config.label}
    </Badge>
  )
}
