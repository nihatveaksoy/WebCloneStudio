"use client"

import { useState } from "react"
import {
  Copy,
  RefreshCw,
  Monitor,
  Smartphone,
  ExternalLink,
  ImageIcon,
  Link2,
  Type,
  Palette,
  Code2,
  Layers,
  Rocket,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import type { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

function LogViewer({ logs }: { logs: Project["clone"]["logs"] }) {
  const [expanded, setExpanded] = useState(false)

  if (logs.length === 0) return null

  return (
    <div className="rounded-lg border bg-muted/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Pipeline Logs ({logs.length})</span>
        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      </button>
      {expanded && (
        <div className="max-h-48 overflow-y-auto border-t px-3 py-2">
          <div className="space-y-1 font-mono text-xs">
            {logs.map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                className={cn(
                  "flex gap-2",
                  entry.level === "error" && "text-destructive",
                  entry.level === "warn" && "text-yellow-600 dark:text-yellow-400"
                )}
              >
                <span className="shrink-0 text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="shrink-0 uppercase text-muted-foreground">
                  [{entry.phase}]
                </span>
                <span>{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DataSection({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count: number
  children: React.ReactNode
}) {
  if (count === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4 text-muted-foreground" />
        <p className="text-sm font-medium">{title}</p>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {count}
        </Badge>
      </div>
      {children}
    </div>
  )
}

function CollapsibleList({
  items,
  maxVisible = 5,
  renderItem,
}: {
  items: string[]
  maxVisible?: number
  renderItem: (item: string, index: number) => React.ReactNode
}) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? items : items.slice(0, maxVisible)
  const remaining = items.length - maxVisible

  return (
    <div className="space-y-1">
      {visible.map((item, i) => renderItem(item, i))}
      {remaining > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-primary hover:underline"
        >
          +{remaining} more...
        </button>
      )}
      {showAll && remaining > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="text-xs text-primary hover:underline"
        >
          Show less
        </button>
      )}
    </div>
  )
}

function ExtractedDataSummary({
  data,
  url,
}: {
  data: NonNullable<Project["clone"]["extractedData"]>
  url: string
}) {
  return (
    <div className="space-y-5">
      {/* Title & Description */}
      {(data.title ?? data.description) && (
        <div className="rounded-lg border bg-muted/20 p-4">
          {data.title && (
            <h3 className="font-semibold text-base mb-1">{data.title}</h3>
          )}
          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}
        </div>
      )}

      {/* Fonts */}
      <DataSection icon={Type} title="Fonts" count={data.fonts.length}>
        <div className="flex flex-wrap gap-1.5">
          {data.fonts.map((font) => (
            <Badge key={font} variant="secondary">{font}</Badge>
          ))}
        </div>
      </DataSection>

      {/* Colors */}
      <DataSection icon={Palette} title="Colors" count={data.colors.length}>
        <div className="flex flex-wrap gap-1.5">
          {data.colors.map((color) => (
            <Badge key={color} variant="outline" className="gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full border"
                style={{ backgroundColor: color }}
              />
              {color}
            </Badge>
          ))}
        </div>
      </DataSection>

      {/* Tech Stack */}
      <DataSection icon={Code2} title="Tech Stack" count={data.techStack.length}>
        <div className="flex flex-wrap gap-1.5">
          {data.techStack.map((tech) => (
            <Badge key={tech} variant="default">{tech}</Badge>
          ))}
        </div>
      </DataSection>

      {/* Headings */}
      <DataSection icon={Layers} title="Headings" count={data.headings.length}>
        <CollapsibleList
          items={data.headings}
          maxVisible={8}
          renderItem={(heading, i) => (
            <p key={i} className="text-sm text-muted-foreground truncate">
              {heading}
            </p>
          )}
        />
      </DataSection>

      {/* Links */}
      <DataSection icon={Link2} title="Links" count={data.links.length}>
        <CollapsibleList
          items={data.links}
          maxVisible={6}
          renderItem={(link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
            >
              <ExternalLink className="size-3 shrink-0" />
              <span className="truncate">{link}</span>
            </a>
          )}
        />
      </DataSection>

      {/* Images */}
      <DataSection icon={ImageIcon} title="Images" count={data.images.length}>
        <CollapsibleList
          items={data.images}
          maxVisible={6}
          renderItem={(img, i) => {
            const absoluteUrl = img.startsWith("http") ? img : new URL(img, url).href
            return (
              <a
                key={i}
                href={absoluteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground truncate"
              >
                <ImageIcon className="size-3 shrink-0" />
                <span className="truncate">{img}</span>
              </a>
            )
          }}
        />
      </DataSection>
    </div>
  )
}

export function CloneTab({
  project,
  onRefresh,
}: {
  project: Project
  onRefresh: () => void
}) {
  const [isStarting, setIsStarting] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const { clone } = project

  async function handleStart() {
    setIsStarting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/clone`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to start analysis")
      }
      toast.success("Site analysis started")
      onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start analysis")
    } finally {
      setIsStarting(false)
    }
  }

  async function handleStartClone() {
    setIsCloning(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/start-clone`, {
        method: "POST",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? "Failed to start cloning")
      }
      toast.success("Cloning process started! This will take a few minutes.")
      onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start cloning")
    } finally {
      setIsCloning(false)
    }
  }

  if (clone.status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Copy className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Ready to Analyze</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Analyze the target website to extract fonts, colors, tech stack,
          headings, links, and images.
        </p>
        <Button onClick={handleStart} disabled={isStarting} size="lg">
          <Copy className="size-4" />
          {isStarting ? "Starting..." : "Analyze Website"}
        </Button>
      </div>
    )
  }

  if (clone.status === "analyzing" || clone.status === "building") {
    return (
      <div className="space-y-4 py-8">
        <div className="text-center">
          <p className="text-sm font-medium mb-1">
            {clone.status === "analyzing" ? "Analyzing website..." : "Building clone..."}
          </p>
          <p className="text-xs text-muted-foreground">This may take a few minutes</p>
        </div>
        <Progress value={clone.progress}>
          <ProgressLabel>Progress</ProgressLabel>
          <ProgressValue />
        </Progress>
        <LogViewer logs={clone.logs} />
      </div>
    )
  }

  if (clone.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <Copy className="size-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Analysis Failed</h3>
        <p className="text-sm text-destructive mb-6 max-w-sm">
          {clone.error ?? "An unknown error occurred during analysis."}
        </p>
        <Button onClick={handleStart} disabled={isStarting} variant="outline">
          <RefreshCw className="size-4" />
          {isStarting ? "Retrying..." : "Retry Analysis"}
        </Button>
        <LogViewer logs={clone.logs} />
      </div>
    )
  }

  // Done state - show extracted data + Start Cloning button
  return (
    <div className="space-y-6">
      {/* Screenshots */}
      {(clone.screenshotDesktop ?? clone.screenshotMobile) && (
        <div>
          <h3 className="text-sm font-medium mb-3">Screenshots</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {clone.screenshotDesktop && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Monitor className="size-3" />
                  Desktop
                </div>
                <img
                  src={clone.screenshotDesktop}
                  alt="Desktop screenshot"
                  className="w-full rounded-lg border object-cover"
                />
              </div>
            )}
            {clone.screenshotMobile && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Smartphone className="size-3" />
                  Mobile
                </div>
                <img
                  src={clone.screenshotMobile}
                  alt="Mobile screenshot"
                  className="w-full max-w-[200px] rounded-lg border object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Extracted Data */}
      {clone.extractedData && (
        <ExtractedDataSummary data={clone.extractedData} url={project.url} />
      )}

      {/* Logs */}
      <LogViewer logs={clone.logs} />

      {/* Separator + Start Cloning CTA */}
      <Separator />

      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Rocket className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Ready to Clone</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Analysis complete. Start the cloning engine to create a pixel-perfect
              reproduction of this website using the extracted design tokens and assets.
            </p>
          </div>
          <Button
            onClick={handleStartClone}
            disabled={isCloning}
            size="lg"
            className="gap-2"
          >
            <Rocket className="size-4" />
            {isCloning ? "Starting Clone Engine..." : "Start Cloning"}
          </Button>
        </div>
      </div>
    </div>
  )
}
