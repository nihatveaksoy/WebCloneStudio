import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getProject, updateProject, isValidProjectId } from "@/lib/db"
import { generateEnhanced } from "@/lib/claude"
import { isUrlSafe } from "@/lib/url-validator"
import type { Suggestion } from "@/types/project"

function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(
  request: Request,
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

    const body = await request.json()

    if (!body.suggestionIds || !Array.isArray(body.suggestionIds)) {
      return NextResponse.json(
        {
          success: false,
          error: "suggestionIds is required and must be an array of strings",
        },
        { status: 400 }
      )
    }

    if (body.suggestionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one suggestion must be selected" },
        { status: 400 }
      )
    }

    // Validate that all suggestion IDs exist
    const allSuggestions = project.analysis.suggestions
    const selectedSuggestions: Suggestion[] = []

    for (const sugId of body.suggestionIds as string[]) {
      const found = allSuggestions.find((s) => s.id === sugId)
      if (!found) {
        return NextResponse.json(
          { success: false, error: "One or more suggestion IDs are invalid" },
          { status: 400 }
        )
      }
      selectedSuggestions.push(found)
    }

    // Set status to building
    updateProject(id, {
      enhanced: {
        ...project.enhanced,
        status: "building",
        appliedSuggestionIds: body.suggestionIds as string[],
      },
    })

    // Prepare clone data
    const cloneData = {
      url: project.url,
      html: undefined as string | undefined,
      extractedData: project.clone.extractedData,
    }

    // Try to get HTML if we have clone output
    if (project.clone.status === "done") {
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
            "User-Agent": "Mozilla/5.0 (compatible; WebCloneStudio/1.0)",
            Accept: "text/html",
          },
        })

        clearTimeout(timeout)

        if (response.ok) {
          const MAX_SIZE = 5 * 1024 * 1024
          const cl = response.headers.get("content-length")
          if (!cl || parseInt(cl, 10) <= MAX_SIZE) {
            const text = await response.text()
            cloneData.html = text.length > MAX_SIZE ? text.slice(0, MAX_SIZE) : text
          }
        }
      } catch {
        // Proceed without HTML
      }
    }

    const headersList = await headers()
    const clientIp = getClientIp(headersList)

    const aiResult = await generateEnhanced(cloneData, selectedSuggestions, clientIp)
    const result = aiResult.data

    // Mark selected suggestions as applied
    const updatedSuggestions = allSuggestions.map((s) => ({
      ...s,
      applied: (body.suggestionIds as string[]).includes(s.id) ? true : s.applied,
    }))

    const updated = updateProject(id, {
      analysis: {
        ...project.analysis,
        suggestions: updatedSuggestions,
      },
      enhanced: {
        status: "done",
        appliedSuggestionIds: body.suggestionIds as string[],
        previewUrl: result.html ? `/api/projects/${id}/preview` : undefined,
        enhancedHtml: result.html ?? undefined,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        project: updated,
        enhanced: result,
      },
    })
  } catch (error) {
    console.error("Enhancement failed:", error)

    try {
      const { id } = await context.params
      updateProject(id, {
        enhanced: {
          status: "error",
          appliedSuggestionIds: [],
          error: "Enhancement failed unexpectedly",
        },
      })
    } catch {
      // Ignore secondary error
    }

    return NextResponse.json(
      { success: false, error: "Enhancement failed" },
      { status: 500 }
    )
  }
}
