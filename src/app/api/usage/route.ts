import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getRemainingTrials, FREE_TRIAL_MAX } from "@/lib/usage"
import { getAnthropicApiKey } from "@/lib/db"
import { isGeminiAvailable } from "@/lib/gemini"

function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  )
}

export async function GET() {
  try {
    const headersList = await headers()
    const clientIp = getClientIp(headersList)
    const remaining = getRemainingTrials(clientIp)
    const hasAnthropicKey = !!getAnthropicApiKey()
    const hasGemini = isGeminiAvailable()

    return NextResponse.json({
      success: true,
      data: {
        hasAnthropicKey,
        hasGemini,
        remainingTrials: remaining,
        maxTrials: FREE_TRIAL_MAX,
        provider: hasAnthropicKey ? "anthropic" : (hasGemini && remaining > 0) ? "gemini-free" : "none",
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to get usage info" },
      { status: 500 }
    )
  }
}
