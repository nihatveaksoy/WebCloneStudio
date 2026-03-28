import { NextResponse } from "next/server"
import { getProject, updateProject, isValidProjectId } from "@/lib/db"
import { isUrlSafe } from "@/lib/url-validator"

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

    if (project.clone.status !== "done") {
      return NextResponse.json(
        { success: false, error: "Please complete the analysis first" },
        { status: 400 }
      )
    }

    // Update status to building
    updateProject(id, {
      clone: {
        ...project.clone,
        status: "building",
        progress: 10,
        logs: [
          ...project.clone.logs,
          {
            timestamp: new Date().toISOString(),
            phase: "clone",
            message: "Clone engine started...",
            level: "info" as const,
          },
        ],
      },
    })

    // Start the clone process in the background
    // This runs the clone-website engine asynchronously
    runCloneEngine(id, project.url).catch((err) => {
      console.error("Clone engine failed:", err)
      const current = getProject(id)
      if (current) {
        updateProject(id, {
          clone: {
            ...current.clone,
            status: "error",
            error: err instanceof Error ? err.message : "Clone engine failed",
            logs: [
              ...current.clone.logs,
              {
                timestamp: new Date().toISOString(),
                phase: "clone",
                message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
                level: "error" as const,
              },
            ],
          },
        })
      }
    })

    return NextResponse.json({ success: true, data: { status: "building" } })
  } catch (error) {
    console.error("Start clone failed:", error)
    return NextResponse.json(
      { success: false, error: "Failed to start clone engine" },
      { status: 500 }
    )
  }
}

async function runCloneEngine(projectId: string, url: string) {
  const { getProject: getProj, updateProject: updateProj, getProjectDataDir } = await import("@/lib/db")
  const fs = await import("fs")
  const path = await import("path")

  const addLog = (phase: string, message: string, level: "info" | "warn" | "error" = "info") => {
    const current = getProj(projectId)
    if (!current) return
    updateProj(projectId, {
      clone: {
        ...current.clone,
        logs: [
          ...current.clone.logs,
          { timestamp: new Date().toISOString(), phase, message, level },
        ],
      },
    })
  }

  const updateProgress = (progress: number) => {
    const current = getProj(projectId)
    if (!current) return
    updateProj(projectId, {
      clone: { ...current.clone, progress },
    })
  }

  try {
    // Step 1: Fetch full HTML
    addLog("clone", `Fetching full page from ${url}...`)
    updateProgress(20)

    // SSRF protection: validate URL before fetching
    const { isUrlSafe: checkUrl } = await import("@/lib/url-validator")
    if (!(await checkUrl(url))) {
      throw new Error("URL points to a private/internal address")
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: HTTP ${response.status}`)
    }

    const html = await response.text()
    addLog("clone", `Downloaded ${(html.length / 1024).toFixed(1)} KB of HTML`)
    updateProgress(30)

    // Step 2: Save HTML to project directory
    const projectDir = getProjectDataDir(projectId)
    const cloneDir = path.join(projectDir, "clone")
    fs.mkdirSync(cloneDir, { recursive: true })

    fs.writeFileSync(path.join(cloneDir, "index.html"), html, "utf-8")
    addLog("clone", "Saved source HTML")
    updateProgress(40)

    // Step 3: Extract and download CSS files
    addLog("clone", "Extracting linked stylesheets...")
    const cssLinks = extractCssLinks(html, url)
    let cssContent = ""

    for (const cssUrl of cssLinks.slice(0, 10)) {
      try {
        if (!(await checkUrl(cssUrl))) {
          addLog("clone", `Blocked private/internal CSS URL: ${cssUrl}`, "warn")
          continue
        }
        const cssRes = await fetch(cssUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        })
        if (cssRes.ok) {
          const css = await cssRes.text()
          cssContent += `\n/* Source: ${cssUrl} */\n${css}\n`
        }
      } catch {
        addLog("clone", `Could not fetch CSS: ${cssUrl}`, "warn")
      }
    }

    if (cssContent) {
      fs.writeFileSync(path.join(cloneDir, "styles.css"), cssContent, "utf-8")
      addLog("clone", `Saved ${cssLinks.length} stylesheet(s)`)
    }
    updateProgress(60)

    // Step 4: Extract inline styles
    addLog("clone", "Extracting inline styles and scripts...")
    const inlineStyles = extractInlineStyles(html)
    if (inlineStyles) {
      fs.writeFileSync(path.join(cloneDir, "inline-styles.css"), inlineStyles, "utf-8")
    }
    updateProgress(70)

    // Step 5: Extract JS framework data
    addLog("clone", "Analyzing page structure...")
    const structureAnalysis = analyzeStructure(html)
    fs.writeFileSync(
      path.join(cloneDir, "structure.json"),
      JSON.stringify(structureAnalysis, null, 2),
      "utf-8"
    )
    updateProgress(80)

    // Step 6: Create a manifest
    const manifest = {
      url,
      clonedAt: new Date().toISOString(),
      htmlSize: html.length,
      cssFiles: cssLinks.length,
      structure: structureAnalysis,
    }
    fs.writeFileSync(
      path.join(cloneDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8"
    )
    addLog("clone", "Created clone manifest")
    updateProgress(90)

    // Step 7: Complete
    addLog("complete", "Clone engine completed successfully!")

    const current = getProj(projectId)
    if (current) {
      updateProj(projectId, {
        clone: {
          ...current.clone,
          status: "done",
          progress: 100,
          outputDir: cloneDir,
        },
      })
    }
  } catch (err) {
    throw err
  }
}

function extractCssLinks(html: string, baseUrl: string): string[] {
  const links: string[] = []
  const regex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    const tag = match[0]
    const href = match[1]

    if (
      tag.includes('rel="stylesheet"') ||
      tag.includes("rel='stylesheet'") ||
      href.endsWith(".css")
    ) {
      try {
        links.push(new URL(href, baseUrl).href)
      } catch {
        // skip invalid
      }
    }
  }

  return links
}

function extractInlineStyles(html: string): string {
  const styles: string[] = []
  const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    if (match[1]?.trim()) {
      styles.push(match[1].trim())
    }
  }

  return styles.join("\n\n")
}

function analyzeStructure(html: string) {
  // Count element types
  const tags: Record<string, number> = {}
  const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)\b/g
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    tags[tag] = (tags[tag] ?? 0) + 1
  }

  // Detect sections
  const hasSections = (tags["section"] ?? 0) > 0
  const hasArticles = (tags["article"] ?? 0) > 0
  const hasNav = (tags["nav"] ?? 0) > 0
  const hasHeader = (tags["header"] ?? 0) > 0
  const hasFooter = (tags["footer"] ?? 0) > 0
  const hasMain = (tags["main"] ?? 0) > 0

  return {
    totalElements: Object.values(tags).reduce((a, b) => a + b, 0),
    uniqueTags: Object.keys(tags).length,
    topTags: Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count })),
    semanticStructure: {
      hasNav,
      hasHeader,
      hasMain,
      hasFooter,
      hasSections,
      hasArticles,
    },
    forms: tags["form"] ?? 0,
    inputs: tags["input"] ?? 0,
    buttons: tags["button"] ?? 0,
    images: tags["img"] ?? 0,
    links: tags["a"] ?? 0,
    scripts: tags["script"] ?? 0,
  }
}
