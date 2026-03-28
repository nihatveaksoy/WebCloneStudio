import type { Suggestion, ExtractedSiteData } from "@/types/project"
import { getMockSuggestions } from "@/lib/mock-data"
import { buildSuggestionsPrompt } from "@/lib/prompts/suggestions"
import { buildEnhancePrompt } from "@/lib/prompts/enhance"
import { getAnthropicApiKey } from "@/lib/db"
import { isGeminiAvailable, geminiAnalyzeWebsite, geminiGenerateEnhanced } from "@/lib/gemini"
import { canUseFreeTrial, incrementUsage, getRemainingTrials } from "@/lib/usage"

interface SiteAnalysisInput {
  url: string
  html: string
  title: string
  description: string
  fonts: string[]
  colors: string[]
  headings: string[]
  techStack: string[]
}

export type AiProvider = "anthropic" | "gemini-free" | "mock"

export interface AiResult<T> {
  data: T
  provider: AiProvider
  remainingTrials?: number
}

function getApiKey(): string | undefined {
  return getAnthropicApiKey()
}

/**
 * Determines which AI provider to use:
 * 1. User has Anthropic API key → use Anthropic
 * 2. Gemini available + free trials remaining → use Gemini
 * 3. Fallback to mock
 */
function resolveProvider(clientIp: string): AiProvider {
  if (getApiKey()) return "anthropic"
  if (isGeminiAvailable() && canUseFreeTrial(clientIp)) return "gemini-free"
  return "mock"
}

export async function analyzeWebsite(
  siteData: SiteAnalysisInput,
  clientIp: string = "unknown"
): Promise<AiResult<Suggestion[]>> {
  const provider = resolveProvider(clientIp)

  if (provider === "anthropic") {
    const apiKey = getApiKey()!
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk")
      const client = new Anthropic({ apiKey })
      const { system, user } = buildSuggestionsPrompt(siteData)
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: user }],
      })
      const textBlock = response.content.find((block) => block.type === "text")
      if (!textBlock || !textBlock.text) throw new Error("No text response from Claude API")
      const suggestions = JSON.parse(textBlock.text) as Suggestion[]
      return { data: suggestions.map((s) => ({ ...s, applied: false })), provider: "anthropic" }
    } catch (error) {
      console.error("Claude API call failed, falling back to mock:", error)
      return { data: getMockSuggestions(siteData.url), provider: "mock" }
    }
  }

  if (provider === "gemini-free") {
    try {
      const suggestions = await geminiAnalyzeWebsite(siteData)
      incrementUsage(clientIp)
      const remaining = getRemainingTrials(clientIp)
      return { data: suggestions, provider: "gemini-free", remainingTrials: remaining }
    } catch (error) {
      console.error("Gemini API call failed, falling back to mock:", error)
      return { data: getMockSuggestions(siteData.url), provider: "mock" }
    }
  }

  // mock
  return { data: getMockSuggestions(siteData.url), provider: "mock" }
}

export async function generateEnhanced(
  cloneData: { url: string; html?: string; extractedData?: ExtractedSiteData },
  suggestions: Suggestion[],
  clientIp: string = "unknown"
): Promise<AiResult<{ html: string; description: string }>> {
  const provider = resolveProvider(clientIp)

  if (provider === "anthropic") {
    const apiKey = getApiKey()!
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk")
      const client = new Anthropic({ apiKey })
      const { system, user } = buildEnhancePrompt(cloneData, suggestions)
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system,
        messages: [{ role: "user", content: user }],
      })
      const textBlock = response.content.find((block) => block.type === "text")
      if (!textBlock || !textBlock.text) throw new Error("No text response from Claude API")
      const result = JSON.parse(textBlock.text) as { html: string; description: string }
      return { data: result, provider: "anthropic" }
    } catch (error) {
      console.error("Claude API enhance call failed, returning mock:", error)
      return { data: getMockEnhancedResult(suggestions), provider: "mock" }
    }
  }

  if (provider === "gemini-free") {
    try {
      const result = await geminiGenerateEnhanced(cloneData, suggestions)
      incrementUsage(clientIp)
      const remaining = getRemainingTrials(clientIp)
      return { data: result, provider: "gemini-free", remainingTrials: remaining }
    } catch (error) {
      console.error("Gemini enhance call failed, returning mock:", error)
      return { data: getMockEnhancedResult(suggestions), provider: "mock" }
    }
  }

  return { data: getMockEnhancedResult(suggestions), provider: "mock" }
}

function getMockEnhancedResult(
  suggestions: Suggestion[]
): { html: string; description: string } {
  const appliedTitles = suggestions.map((s) => s.title).join(", ")

  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Clone</title>
  <style>
    /* Enhanced styles with applied suggestions */
    :root { color-scheme: light dark; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <main>
    <p>Enhanced version with ${suggestions.length} improvements applied.</p>
  </main>
</body>
</html>`,
    description: `Applied ${suggestions.length} improvements: ${appliedTitles}. The enhanced version includes better accessibility, improved performance patterns, and modern web standards.`,
  }
}
