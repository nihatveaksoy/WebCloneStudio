import type { ExtractedSiteData } from "@/types/project"

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

export function buildSuggestionsPrompt(siteData: SiteAnalysisInput): {
  system: string
  user: string
} {
  const system = `You are a senior web development consultant specializing in UX, performance, accessibility, and modern web patterns.

You analyze websites and provide actionable improvement suggestions.

You MUST respond with a valid JSON array of suggestion objects. No markdown, no explanation — only the JSON array.

Each suggestion object must have this exact shape:
{
  "id": "sug-<category>-<3digit>",
  "category": one of "ux" | "performance" | "accessibility" | "modern-patterns" | "design" | "seo",
  "priority": one of "high" | "medium" | "low",
  "title": short title (under 60 chars),
  "description": detailed explanation (2-3 sentences),
  "currentState": what the site currently does,
  "suggestedState": what it should do instead,
  "effort": one of "easy" | "medium" | "hard",
  "applied": false
}

Return 6-8 suggestions covering at least 4 different categories. Prioritize high-impact, actionable improvements.`

  const extractedInfo = formatExtractedData(siteData)

  const user = `Analyze this website and provide improvement suggestions.

URL: ${siteData.url}
Title: ${siteData.title || "Not found"}
Description: ${siteData.description || "Not found"}

${extractedInfo}

HTML excerpt (first 3000 chars):
${siteData.html.slice(0, 3000)}

Provide your suggestions as a JSON array.`

  return { system, user }
}

function formatExtractedData(data: Partial<ExtractedSiteData> & { url: string; html: string }): string {
  const parts: string[] = []

  if (data.fonts && data.fonts.length > 0) {
    parts.push(`Fonts detected: ${data.fonts.join(", ")}`)
  }
  if (data.colors && data.colors.length > 0) {
    parts.push(`Colors found: ${data.colors.join(", ")}`)
  }
  if (data.headings && data.headings.length > 0) {
    parts.push(`Headings: ${data.headings.slice(0, 10).join(", ")}`)
  }
  if (data.techStack && data.techStack.length > 0) {
    parts.push(`Tech stack: ${data.techStack.join(", ")}`)
  }

  return parts.length > 0 ? `Extracted data:\n${parts.join("\n")}` : ""
}
