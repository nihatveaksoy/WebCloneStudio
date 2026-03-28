"use client"

import { useState, useEffect } from "react"
import { FlaskConical, Settings, Sparkles } from "lucide-react"

interface UsageInfo {
  hasAnthropicKey: boolean
  hasGemini: boolean
  remainingTrials: number
  maxTrials: number
  provider: "anthropic" | "gemini-free" | "none"
}

export function MockModeBanner() {
  const [state, setState] = useState<"loading" | "anthropic" | "gemini" | "mock">("loading")
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/usage").then((r) => r.json()),
    ])
      .then(([settingsRes, usageRes]) => {
        const hasKey = !!settingsRes.data?.hasApiKey
        const usage = usageRes.data as UsageInfo | undefined
        setUsageInfo(usage ?? null)

        if (hasKey) setState("anthropic")
        else if (usage?.provider === "gemini-free") setState("gemini")
        else setState("mock")
      })
      .catch(() => setState("mock"))
  }, [])

  if (state === "loading" || state === "anthropic") return null

  if (state === "gemini") {
    const remaining = usageInfo?.remainingTrials ?? 0
    const max = usageInfo?.maxTrials ?? 2
    return (
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
        <Sparkles className="size-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="min-w-0 text-xs text-blue-800 dark:text-blue-200">
          <strong>Free Trial</strong> &mdash; AI analysis powered by Gemini.
          {" "}{remaining}/{max} uses remaining.
          Add your Anthropic API key in{" "}
          <SettingsButton className="text-blue-900 dark:text-blue-100 hover:text-blue-950 dark:hover:text-blue-50" />
          {" "}for unlimited access.
        </div>
      </div>
    )
  }

  // mock mode
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/50">
      <FlaskConical className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
      <div className="min-w-0 text-xs text-amber-800 dark:text-amber-200">
        <strong>Demo Mode</strong> &mdash; These are sample suggestions.
        To get real AI-powered analysis, add your Anthropic API key in{" "}
        <SettingsButton className="text-amber-900 dark:text-amber-100 hover:text-amber-950" />
      </div>
    </div>
  )
}

function SettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const btn = document.querySelector<HTMLButtonElement>(
          '[data-slot="dialog-trigger"] .lucide-settings, button:has(.lucide-settings)'
        )
        const settingsBtn = btn?.closest("button") ?? document.querySelector<HTMLButtonElement>('button:has([class*="lucide-settings"])')
        settingsBtn?.click()
      }}
      className={`inline-flex items-center gap-0.5 font-medium underline underline-offset-2 ${className ?? ""}`}
    >
      <Settings className="size-3" />
      Settings
    </button>
  )
}
