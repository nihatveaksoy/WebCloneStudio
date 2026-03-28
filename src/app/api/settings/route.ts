import { NextResponse } from "next/server"
import { getSettings, updateSettings, getAnthropicApiKey } from "@/lib/db"

export async function GET() {
  try {
    const settings = getSettings()
    const hasApiKey = Boolean(getAnthropicApiKey())
    // Never expose the full key, just whether it's set and source
    const keySource = process.env.ANTHROPIC_API_KEY
      ? "env"
      : settings.anthropicApiKey
        ? "settings"
        : null

    return NextResponse.json({
      success: true,
      data: {
        hasApiKey,
        keySource,
        // Mask the key: show first 8 chars + last 4
        maskedKey: hasApiKey
          ? maskKey(getAnthropicApiKey()!)
          : null,
      },
    })
  } catch (error) {
    console.error("Failed to get settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to get settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (typeof body.anthropicApiKey === "string") {
      const key = body.anthropicApiKey.trim()

      if (key && !key.startsWith("sk-")) {
        return NextResponse.json(
          { success: false, error: "Invalid API key format. Key should start with 'sk-'" },
          { status: 400 }
        )
      }

      updateSettings({ anthropicApiKey: key || undefined })

      return NextResponse.json({
        success: true,
        data: {
          hasApiKey: Boolean(key),
          keySource: key ? "settings" : null,
          maskedKey: key ? maskKey(key) : null,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: "No valid settings provided" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    )
  }
}

function maskKey(key: string): string {
  if (key.length <= 8) return "sk-****"
  return `sk-****...${key.slice(-4)}`
}
