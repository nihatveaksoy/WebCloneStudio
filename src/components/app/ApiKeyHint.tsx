"use client"

import { useState, useEffect } from "react"
import { Key, Check, Loader2, Eye, EyeOff, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface UsageInfo {
  hasAnthropicKey: boolean
  hasGemini: boolean
  remainingTrials: number
  maxTrials: number
  provider: "anthropic" | "gemini-free" | "none"
}

export function ApiKeyHint() {
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)
  const [hasUserKey, setHasUserKey] = useState(false)
  const [useFreeTrial, setUseFreeTrial] = useState(true)
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/usage").then((r) => r.json()),
    ])
      .then(([settingsRes, usageRes]) => {
        const hasKey = !!settingsRes.data?.hasApiKey
        const usage = usageRes.data as UsageInfo | undefined
        setHasUserKey(hasKey)
        setUsageInfo(usage ?? null)
        // If user already has their own key, default checkbox off
        if (hasKey) setUseFreeTrial(false)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  async function handleSave() {
    if (!apiKey.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicApiKey: apiKey.trim() }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? "Failed to save")
      setHasUserKey(true)
      setApiKey("")
      toast.success("API key saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  if (!loaded) return null

  const geminiAvailable = usageInfo?.hasGemini ?? false
  const remaining = usageInfo?.remainingTrials ?? 0
  const max = usageInfo?.maxTrials ?? 2
  const trialExpired = geminiAvailable && remaining === 0

  return (
    <div className="space-y-3">
      {/* Free trial checkbox */}
      {geminiAvailable && (
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={useFreeTrial}
            onChange={(e) => setUseFreeTrial(e.target.checked)}
            disabled={trialExpired && !hasUserKey}
            className="mt-0.5 size-4 rounded border-gray-300 text-primary accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex-1 space-y-0.5">
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3 text-blue-500" />
              {trialExpired
                ? "Free trial used up"
                : `Use free AI trial (${remaining}/${max} remaining)`}
            </span>
            <p className="text-[11px] text-muted-foreground">
              {trialExpired
                ? "Add your Anthropic API key for unlimited access"
                : "Powered by Gemini. Add your own key for unlimited analyses."}
            </p>
          </div>
        </label>
      )}

      {/* User's own API key status */}
      {hasUserKey && (
        <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900 dark:bg-green-950/50">
          <Check className="size-3.5 text-green-600 dark:text-green-400" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            Your Anthropic API key is active (unlimited)
          </span>
        </div>
      )}

      {/* API key input — show when no user key */}
      {!hasUserKey && (
        <div className="space-y-1.5">
          <Label htmlFor="inline-api-key" className="text-xs">
            Anthropic API Key
          </Label>
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Input
                id="inline-api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-api03-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isSaving}
                className="pr-8 text-xs h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSave()
                  }
                }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              </button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs"
              disabled={!apiKey.trim() || isSaving}
              onClick={handleSave}
            >
              {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Key className="size-3" />}
              Save
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
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
      )}
    </div>
  )
}
