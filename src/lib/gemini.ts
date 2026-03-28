import type { Suggestion, ExtractedSiteData } from "@/types/project"
import { buildSuggestionsPrompt } from "@/lib/prompts/suggestions"
import { buildEnhancePrompt } from "@/lib/prompts/enhance"

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

function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || undefined
}

export function isGeminiAvailable(): boolean {
  return !!getGeminiApiKey()
}

export async function geminiAnalyzeWebsite(
  siteData: SiteAnalysisInput
): Promise<Suggestion[]> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured")

  const { GoogleGenerativeAI } = await import("@google/generative-ai")
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

  const { system, user } = buildSuggestionsPrompt(siteData)

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.7,
    },
  })

  const text = result.response.text()
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error("No JSON array found in Gemini response")

  const suggestions = JSON.parse(jsonMatch[0]) as Suggestion[]
  return suggestions.map((s) => ({ ...s, applied: false }))
}

export async function geminiGenerateEnhanced(
  cloneData: { url: string; html?: string; extractedData?: ExtractedSiteData },
  suggestions: Suggestion[]
): Promise<{ html: string; description: string }> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured")

  const { GoogleGenerativeAI } = await import("@google/generative-ai")
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

  const { system, user } = buildEnhancePrompt(cloneData, suggestions)

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  })

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON object found in Gemini response")

  return JSON.parse(jsonMatch[0]) as { html: string; description: string }
}
