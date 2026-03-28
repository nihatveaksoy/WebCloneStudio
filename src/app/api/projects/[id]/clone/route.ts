import { NextResponse } from "next/server"
import { getProject, updateProject, isValidProjectId } from "@/lib/db"
import { isUrlSafe } from "@/lib/url-validator"
import type { ExtractedSiteData, LogEntry } from "@/types/project"

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!isValidProjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid project ID" },
        { status: 400 }
      )
    }

    const project = getProject(id)
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      )
    }

    const logs: LogEntry[] = []
    const addLog = (phase: string, message: string, level: LogEntry["level"] = "info") => {
      logs.push({ timestamp: new Date().toISOString(), phase, message, level })
    }

    // Set status to analyzing
    updateProject(id, {
      clone: { ...project.clone, status: "analyzing", progress: 10, logs },
    })

    addLog("fetch", `Fetching ${project.url}...`)

    // SSRF protection: validate URL before fetching
    if (!(await isUrlSafe(project.url))) {
      return NextResponse.json(
        { success: false, error: "URL points to a private/internal address" },
        { status: 400 }
      )
    }

    let html: string
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(project.url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; WebCloneStudio/1.0; +https://webclonestudio.dev)",
          Accept: "text/html,application/xhtml+xml",
        },
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Response size limit (5MB)
      const MAX_RESPONSE_SIZE = 5 * 1024 * 1024
      const contentLength = response.headers.get("content-length")
      if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
        throw new Error("Response too large (>5MB)")
      }

      html = await response.text()
      if (html.length > MAX_RESPONSE_SIZE) {
        html = html.slice(0, MAX_RESPONSE_SIZE)
      }
      addLog("fetch", `Received ${html.length} bytes`, "info")
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Unknown fetch error"
      addLog("fetch", `Failed to fetch: ${message}`, "error")

      const updated = updateProject(id, {
        clone: {
          ...project.clone,
          status: "error",
          progress: 0,
          logs,
          error: `Failed to fetch URL: ${message}`,
        },
      })

      return NextResponse.json({ success: true, data: updated })
    }

    // Extract data from HTML
    addLog("extract", "Extracting site data...")

    const extractedData = extractSiteData(html, project.url)

    addLog("extract", `Found: ${extractedData.headings.length} headings, ${extractedData.fonts.length} fonts, ${extractedData.colors.length} colors, ${extractedData.links.length} links`)
    addLog("complete", "Clone analysis complete")

    const updated = updateProject(id, {
      clone: {
        status: "done",
        progress: 100,
        logs,
        extractedData,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("Clone pipeline failed:", error)
    return NextResponse.json(
      { success: false, error: "Clone pipeline failed" },
      { status: 500 }
    )
  }
}

function extractSiteData(html: string, url: string): ExtractedSiteData {
  const title = extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  const description = extractMetaContent(html, "description")

  const fonts = extractFonts(html)
  const colors = extractColors(html)
  const headings = extractAll(html, /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi).map(
    stripTags
  )
  const links = extractLinks(html, url)
  const images = extractAll(html, /<img[^>]+src=["']([^"']+)["']/gi)
  const techStack = detectTechStack(html)

  return {
    title: title ? stripTags(title).trim() : undefined,
    description: description ? decodeHtmlEntities(description.trim()) : undefined,
    fonts: unique(fonts),
    colors: unique(colors).slice(0, 20),
    images: images.slice(0, 50),
    headings: headings.slice(0, 30),
    links: unique(links).slice(0, 50),
    techStack: unique(techStack),
  }
}

function extractFirst(html: string, regex: RegExp): string | undefined {
  const match = regex.exec(html)
  return match?.[1]
}

function extractMetaContent(html: string, name: string): string | undefined {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(
    `<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*?)["']`,
    "i"
  )
  const match = regex.exec(html)
  if (match) return match[1]

  // Try reverse attribute order
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']${escaped}["']`,
    "i"
  )
  const match2 = regex2.exec(html)
  return match2?.[1]
}

function extractAll(html: string, regex: RegExp): string[] {
  const results: string[] = []
  let match: RegExpExecArray | null

  const cloned = new RegExp(regex.source, regex.flags)
  while ((match = cloned.exec(html)) !== null) {
    if (match[1]) results.push(match[1])
  }

  return results
}

function extractFonts(html: string): string[] {
  const fonts: string[] = []

  // Google Fonts links
  const googleFontMatches = extractAll(
    html,
    /fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/gi
  )
  for (const match of googleFontMatches) {
    const families = decodeURIComponent(match).split("|")
    for (const family of families) {
      const name = family.split(":")[0].replace(/\+/g, " ")
      if (name) fonts.push(name)
    }
  }

  // font-family in style tags
  const fontFamilyMatches = extractAll(
    html,
    /font-family\s*:\s*["']?([^;"']+)/gi
  )
  for (const match of fontFamilyMatches) {
    const first = match.split(",")[0].trim().replace(/["']/g, "")
    if (first && !first.includes("inherit") && !first.includes("initial")) {
      fonts.push(first)
    }
  }

  return fonts
}

function extractColors(html: string): string[] {
  const colors: string[] = []

  // Hex colors
  const hexMatches = extractAll(html, /#([0-9a-fA-F]{3,8})\b/g)
  for (const hex of hexMatches) {
    if (hex.length === 3 || hex.length === 6 || hex.length === 8) {
      colors.push(`#${hex}`)
    }
  }

  // rgb/rgba
  const rgbMatches = extractAll(
    html,
    /(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\))/gi
  )
  colors.push(...rgbMatches)

  return colors
}

function extractLinks(html: string, baseUrl: string): string[] {
  const hrefs = extractAll(html, /<a[^>]+href=["']([^"'#]+)["']/gi)
  const resolved: string[] = []

  for (const href of hrefs) {
    try {
      const absolute = new URL(href, baseUrl).href
      resolved.push(absolute)
    } catch {
      // Skip invalid URLs
    }
  }

  return resolved
}

function detectTechStack(html: string): string[] {
  const stack: string[] = []

  if (html.includes("__NEXT_DATA__") || html.includes("/_next/")) stack.push("Next.js")
  if (html.includes("__NUXT__") || html.includes("/_nuxt/")) stack.push("Nuxt.js")
  if (html.includes("ng-version")) stack.push("Angular")
  if (html.includes("data-reactroot") || html.includes("__REACT")) stack.push("React")
  if (html.includes("data-v-")) stack.push("Vue.js")
  if (html.includes("wp-content") || html.includes("wp-includes")) stack.push("WordPress")
  if (html.includes("Shopify.theme")) stack.push("Shopify")
  if (html.includes("tailwindcss") || /class="[^"]*\b(flex|grid|text-|bg-|p-|m-)\b/.test(html)) stack.push("Tailwind CSS")
  if (html.includes("bootstrap") || html.includes("Bootstrap")) stack.push("Bootstrap")
  if (html.includes("jquery") || html.includes("jQuery")) stack.push("jQuery")
  if (html.includes("googleapis.com/css")) stack.push("Google Fonts")
  if (html.includes("gtag(") || html.includes("google-analytics")) stack.push("Google Analytics")

  return stack
}

function stripTags(str: string): string {
  return decodeHtmlEntities(
    str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  )
}

function decodeHtmlEntities(str: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&nbsp;": " ",
  }

  return str
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);/gi, (match) => entities[match.toLowerCase()] ?? match)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
}

function unique(arr: string[]): string[] {
  return [...new Set(arr)]
}
