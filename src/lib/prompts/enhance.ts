import type { Suggestion, ExtractedSiteData } from "@/types/project"

interface CloneData {
  url: string
  html?: string
  extractedData?: ExtractedSiteData
}

export function buildEnhancePrompt(
  cloneData: CloneData,
  selectedSuggestions: Suggestion[]
): { system: string; user: string } {
  const system = `You are an expert web developer tasked with enhancing a cloned website.

Given the original site data and a list of selected improvements, describe how each improvement would be applied and provide an enhanced HTML structure.

Respond with a JSON object:
{
  "html": "<enhanced HTML string with improvements applied>",
  "description": "<summary of all improvements applied, 3-5 sentences>"
}

Only return the JSON object. No markdown, no explanation outside the JSON.`

  const suggestionsText = selectedSuggestions
    .map(
      (s, i) =>
        `${i + 1}. [${s.category}/${s.priority}] ${s.title}\n   Current: ${s.currentState}\n   Target: ${s.suggestedState}`
    )
    .join("\n\n")

  const siteContext = cloneData.extractedData
    ? formatSiteContext(cloneData.extractedData)
    : ""

  const user = `Enhance this website by applying the selected improvements.

URL: ${cloneData.url}
${siteContext}

Selected improvements to apply:
${suggestionsText}

${cloneData.html ? `Original HTML excerpt (first 3000 chars):\n${cloneData.html.slice(0, 3000)}` : "No HTML available — generate improvements based on the suggestions alone."}

Return the enhanced result as a JSON object with "html" and "description" fields.`

  return { system, user }
}

function formatSiteContext(data: ExtractedSiteData): string {
  const parts: string[] = []

  if (data.title) parts.push(`Title: ${data.title}`)
  if (data.description) parts.push(`Description: ${data.description}`)
  if (data.fonts.length > 0) parts.push(`Fonts: ${data.fonts.join(", ")}`)
  if (data.colors.length > 0) parts.push(`Colors: ${data.colors.join(", ")}`)
  if (data.headings.length > 0) parts.push(`Headings: ${data.headings.slice(0, 8).join(", ")}`)
  if (data.techStack.length > 0) parts.push(`Tech: ${data.techStack.join(", ")}`)

  return parts.length > 0 ? `\nSite context:\n${parts.join("\n")}` : ""
}
