"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { ApiKeyHint } from "@/components/app/ApiKeyHint"

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export function NewProjectDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const normalized = normalizeUrl(url)
    if (!isValidUrl(normalized)) {
      toast.error("Please enter a valid domain (e.g. example.com)")
      return
    }

    setIsCreating(true)

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(
          body?.error ?? `Failed to create project (${res.status})`
        )
      }

      const result = await res.json()
      const project = result.data ?? result
      toast.success("Project created")
      setOpen(false)
      setUrl("")
      router.push(`/project/${project.id}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="size-4" data-icon="inline-start" />
            New Project
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Website</DialogTitle>
          <DialogDescription>
            Enter the URL of the website you want to clone and analyze
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="project-url">Website URL</Label>
            <Input
              id="project-url"
              type="text"
              placeholder="example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                e.target.setCustomValidity("")
              }}
              onInvalid={(e) =>
                (e.target as HTMLInputElement).setCustomValidity("Please enter a website URL")
              }
              required
              autoFocus
              disabled={isCreating}
            />
          </div>

          <ApiKeyHint />

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 dark:border-blue-900 dark:bg-blue-950/50">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-3.5 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
                Your API key stays private — stored only in your browser session,
                never sent to our servers or shared with third parties.
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" type="button" disabled={isCreating} />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
