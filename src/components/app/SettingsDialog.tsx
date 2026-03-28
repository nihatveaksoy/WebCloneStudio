"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Settings, Eye, EyeOff, Check, Loader2, Key, ShieldCheck } from "lucide-react"
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
} from "@/components/ui/dialog"

interface SettingsData {
  hasApiKey: boolean
  keySource: "env" | "settings" | null
  maskedKey: string | null
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open])

  async function loadSettings() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings(data.data)
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicApiKey: apiKey }),
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error ?? "Failed to save")
      }
      setSettings(result.data)
      setApiKey("")
      toast.success(apiKey ? "API key saved" : "API key removed")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRemoveKey() {
    setIsSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicApiKey: "" }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setSettings(result.data)
      setApiKey("")
      toast.success("API key removed")
    } catch {
      toast.error("Failed to remove API key")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="size-4" />
            <span className="sr-only">Settings</span>
          </button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys for AI-powered features
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current status */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm">
                <Key className="size-4 text-muted-foreground" />
                <span className="font-medium">Anthropic API Key</span>
                {settings?.hasApiKey ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Check className="size-3" />
                    Active
                    {settings.keySource === "env" && (
                      <span className="text-muted-foreground">(env)</span>
                    )}
                  </span>
                ) : (
                  <span className="ml-auto text-xs text-amber-600 dark:text-amber-400">
                    Not configured
                  </span>
                )}
              </div>
              {settings?.maskedKey && (
                <p className="mt-1 text-xs text-muted-foreground font-mono">
                  {settings.maskedKey}
                </p>
              )}
            </div>

            {settings?.keySource === "env" ? (
              <p className="text-xs text-muted-foreground">
                API key is set via ANTHROPIC_API_KEY environment variable.
                To change it, update your .env file and restart the server.
              </p>
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="api-key">
                    {settings?.hasApiKey ? "Update API Key" : "Enter API Key"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showKey ? "text" : "password"}
                      placeholder="sk-ant-api03-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={isSaving}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your key from{" "}
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      console.anthropic.com
                    </a>
                  </p>
                </div>

                <DialogFooter>
                  {settings?.hasApiKey && settings.keySource === "settings" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveKey}
                      disabled={isSaving}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove Key
                    </Button>
                  )}
                  <Button type="submit" size="sm" disabled={!apiKey.trim() || isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Key"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {/* Info about mock mode */}
            {!settings?.hasApiKey && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/50">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Mock Mode Active:</strong> Without an API key,
                  suggestions and enhancements use sample data. Add your
                  Anthropic API key to get real AI-powered analysis.
                </p>
              </div>
            )}

            {/* Privacy notice */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
              <div className="flex items-start gap-2">
                <ShieldCheck className="size-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    Your key stays private
                  </p>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
                    Your API key is stored only in your browser session and is never
                    sent to our servers, logged, or shared with third parties.
                    All AI requests are made directly from your instance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
