import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getProject, updateProject, isValidProjectId } from "@/lib/db"
import { analyzeWebsite } from "@/lib/claude"
import { isUrlSafe } from "@/lib/url-validator"

function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  )
}

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

    // Set status to analyzing
    updateProject(id, {
      analysis: { ...project.analysis, status: "analyzing" },
    })

    // Build site data from clone results or do a quick fetch
    let html = ""
    let title = ""
    let description = ""
    let fonts: string[] = []
    let colors: string[] = []
    let headings: string[] = []
    let techStack: string[] = []

    if (project.clone.extractedData) {
      const data = project.clone.extractedData
      title = data.title ?? ""
      description = data.description ?? ""
      fonts = data.fonts
      colors = data.colors
      headings = data.headings
      techStack = data.techStack
    }

    // If we don't have HTML from clone, do a quick fetch
    if (!html) {
      // SSRF protection: validate URL before fetching
      if (!(await isUrlSafe(project.url))) {
        return NextResponse.json(
          { success: false, error: "URL points to a private/internal address" },
          { status: 400 }
        )
      }

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(project.url, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; WebCloneStudio/1.0)",
            Accept: "text/html",
          },
        })

        clearTimeout(timeout)

        if (response.ok) {
          const MAX_SIZE = 5 * 1024 * 1024
          const cl = response.headers.get("content-length")
          if (cl && parseInt(cl, 10) > MAX_SIZE) {
            // Skip — too large
          } else {
            const text = await response.text()
            html = text.length > MAX_SIZE ? text.slice(0, MAX_SIZE) : text
          }
        }
      } catch {
        // If fetch fails, proceed with whatever data we have
      }
    }

    const headersList = await headers()
    const clientIp = getClientIp(headersList)

    const result = await analyzeWebsite({
      url: project.url,
      html,
      title,
      description,
      fonts,
      colors,
      headings,
      techStack,
    }, clientIp)

    const updated = updateProject(id, {
      analysis: {
        status: "done",
        suggestions: result.data,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      provider: result.provider,
      remainingTrials: result.remainingTrials,
    })
  } catch (error) {
    console.error("Analysis failed:", error)

    // Try to update project status to error
    try {
      const { id } = await context.params
      updateProject(id, {
        analysis: {
          status: "error",
          suggestions: [],
          error: "Analysis failed unexpectedly",
        },
      })
    } catch {
      // Ignore secondary error
    }

    return NextResponse.json(
      { success: false, error: "Analysis failed" },
      { status: 500 }
    )
  }
}
