import { NextResponse } from "next/server"
import { v4 as uuidv4, validate as uuidValidate } from "uuid"
import { getAllProjects, createProject } from "@/lib/db"
import { createEmptyProject } from "@/types/project"
import { isUrlSafe } from "@/lib/url-validator"

export async function GET() {
  try {
    const projects = getAllProjects()
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json(
        { success: false, error: "URL is required and must be a string" },
        { status: 400 }
      )
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(body.url)
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      )
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { success: false, error: "URL must use http or https protocol" },
        { status: 400 }
      )
    }

    // SSRF protection: validate URL before accepting
    if (!(await isUrlSafe(body.url))) {
      return NextResponse.json(
        { success: false, error: "URL points to a private/internal address" },
        { status: 400 }
      )
    }

    const id = uuidv4()
    if (!uuidValidate(id)) {
      return NextResponse.json(
        { success: false, error: "Failed to generate valid project ID" },
        { status: 500 }
      )
    }
    const project = createEmptyProject(id, body.url)
    const saved = createProject(project)

    // Auto-start clone + analyze in the background
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

    autoStartPipelines(baseUrl, id).catch((err) => {
      console.error("Auto-start pipelines failed:", err)
    })

    return NextResponse.json({ success: true, data: saved }, { status: 201 })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    )
  }
}

async function autoStartPipelines(baseUrl: string, projectId: string) {
  try {
    // Step 1: Run clone
    const cloneRes = await fetch(`${baseUrl}/api/projects/${projectId}/clone`, {
      method: "POST",
    })
    if (!cloneRes.ok) {
      console.error("Auto-clone failed:", await cloneRes.text())
      return
    }

    // Step 2: Run analyze (after clone completes)
    const analyzeRes = await fetch(`${baseUrl}/api/projects/${projectId}/analyze`, {
      method: "POST",
    })
    if (!analyzeRes.ok) {
      console.error("Auto-analyze failed:", await analyzeRes.text())
    }
  } catch (err) {
    console.error("Auto-start error:", err)
  }
}
