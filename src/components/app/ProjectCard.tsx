"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Globe, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Project, PipelineStatus } from "@/types/project"
import { DEMO_PROJECT_ID } from "@/lib/seed-demo"

interface ProjectCardProps {
  project: Project
}

function relativeTime(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "just now"
}

function statusVariant(status: PipelineStatus) {
  switch (status) {
    case "idle":
      return "secondary" as const
    case "analyzing":
    case "building":
      return "default" as const
    case "done":
      return "outline" as const
    case "error":
      return "destructive" as const
  }
}

function statusLabel(prefix: string, status: PipelineStatus): string {
  switch (status) {
    case "idle":
      return `${prefix}: Idle`
    case "analyzing":
      return `${prefix}: Analyzing`
    case "building":
      return `${prefix}: Building`
    case "done":
      return `${prefix}: Done`
    case "error":
      return `${prefix}: Error`
  }
}

function truncateUrl(url: string, maxLength = 40): string {
  if (url.length <= maxLength) return url
  return `${url.slice(0, maxLength)}...`
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const cleaned = hex.replace("#", "")
  if (cleaned.length < 6) return null
  const r = parseInt(cleaned.slice(0, 2), 16) / 255
  const g = parseInt(cleaned.slice(2, 4), 16) / 255
  const b = parseInt(cleaned.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s, l }
}

function getBrandColors(project: Project): string[] {
  const colors = project.clone.extractedData?.colors
  if (!colors || colors.length === 0) return []

  // Score colors by vividness: prefer high saturation + medium lightness
  const scored: { color: string; score: number }[] = []
  for (const color of colors) {
    if (!color.startsWith("#") || color.length < 4) continue
    const hsl = hexToHsl(color)
    if (!hsl) continue
    if (hsl.l > 0.85 || hsl.l < 0.15) continue // skip near-white/black
    if (hsl.s < 0.2) continue // skip grays
    // Score: higher saturation + closer to 0.5 lightness = better
    const lScore = 1 - Math.abs(hsl.l - 0.5) * 2 // peaks at l=0.5
    const score = hsl.s * 0.7 + lScore * 0.3
    scored.push({ color, score })
  }

  // Sort by score descending — most vivid first
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3).map((s) => s.color)
}

function buildCardStyle(brandColors: string[]): React.CSSProperties {
  if (brandColors.length === 0) {
    return { background: "rgba(255,255,255,0.97)" }
  }
  // Use primary brand color with strong presence
  const primary = brandColors[0]
  return {
    background: `linear-gradient(135deg, ${primary}55 0%, ${primary}30 60%, rgba(255,255,255,0.98) 100%)`,
    borderColor: `${primary}60`,
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const isDemo = project.id === DEMO_PROJECT_ID
  const brandColors = getBrandColors(project)
  const cardStyle = buildCardStyle(brandColors)

  const isActive =
    project.clone.status === "analyzing" ||
    project.clone.status === "building" ||
    project.analysis.status === "analyzing" ||
    project.analysis.status === "building" ||
    project.enhanced.status === "analyzing" ||
    project.enhanced.status === "building"

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Delete project "${project.name}"?`)) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Project deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete project")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Link href={`/project/${project.id}`} className="block group/link">
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
          "cursor-pointer relative overflow-hidden",
          "backdrop-blur-xl shadow-sm"
        )}
        style={cardStyle}
      >
        {/* Demo badge */}
        {isDemo && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 z-10 text-[10px] px-1.5 py-0"
          >
            DEMO
          </Badge>
        )}

        {/* Delete button (hidden for demo) */}
        {!isDemo && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-3 right-3 z-10 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover/link:opacity-100 disabled:opacity-50"
            aria-label="Delete project"
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </button>
        )}

        <CardHeader>
          <CardTitle className="flex items-center gap-2 pr-8">
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt=""
                className="size-5 rounded object-cover"
              />
            ) : (
              <Globe className="size-5 text-muted-foreground" />
            )}
            {project.name}
          </CardTitle>
          <CardDescription className="truncate">
            {truncateUrl(project.url)}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={statusVariant(project.clone.status)}
              className={cn(
                isActive && project.clone.status !== "idle" && project.clone.status !== "done" && project.clone.status !== "error" && "animate-pulse"
              )}
            >
              {statusLabel("Clone", project.clone.status)}
            </Badge>
            <Badge
              variant={statusVariant(project.analysis.status)}
              className={cn(
                isActive && project.analysis.status !== "idle" && project.analysis.status !== "done" && project.analysis.status !== "error" && "animate-pulse"
              )}
            >
              {statusLabel("AI", project.analysis.status)}
            </Badge>
            <Badge
              variant={statusVariant(project.enhanced.status)}
              className={cn(
                isActive && project.enhanced.status !== "idle" && project.enhanced.status !== "done" && project.enhanced.status !== "error" && "animate-pulse"
              )}
            >
              {statusLabel("Enhanced", project.enhanced.status)}
            </Badge>
          </div>
        </CardContent>

        <CardFooter>
          <time
            dateTime={project.createdAt}
            className="text-xs text-muted-foreground"
          >
            Created {relativeTime(project.createdAt)}
          </time>
        </CardFooter>
      </Card>
    </Link>
  )
}
