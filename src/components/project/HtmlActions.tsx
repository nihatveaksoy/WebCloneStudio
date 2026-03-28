"use client"

import { useState } from "react"
import { Copy, Download, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface HtmlActionsProps {
  /** URL to fetch HTML from, or raw HTML string */
  source: { type: "url"; url: string } | { type: "html"; html: string }
  filename: string
  label?: string
}

export function HtmlActions({ source, filename, label = "HTML" }: HtmlActionsProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function getHtml(): Promise<string | null> {
    if (source.type === "html") return source.html

    setIsLoading(true)
    try {
      const res = await fetch(source.url)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      return await res.text()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch HTML")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy() {
    const html = await getHtml()
    if (!html) return

    try {
      await navigator.clipboard.writeText(html)
      setIsCopied(true)
      toast.success(`${label} copied to clipboard`)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  async function handleDownload() {
    const html = await getHtml()
    if (!html) return

    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`${filename} downloaded`)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={isLoading}
        className="h-7 gap-1.5 text-xs"
      >
        {isCopied ? (
          <Check className="size-3 text-green-600" />
        ) : isLoading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Copy className="size-3" />
        )}
        {isCopied ? "Copied!" : `Copy ${label}`}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isLoading}
        className="h-7 gap-1.5 text-xs"
      >
        {isLoading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Download className="size-3" />
        )}
        Download
      </Button>
    </div>
  )
}
