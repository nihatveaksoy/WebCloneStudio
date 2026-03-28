import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import type { Project } from "@/types/project"
import { createDemoProject, DEMO_PROJECT_ID } from "@/lib/seed-demo"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidProjectId(id: string): boolean {
  return id === DEMO_PROJECT_ID || UUID_REGEX.test(id)
}

const IS_VERCEL = !!process.env.VERCEL
const DATA_DIR = IS_VERCEL ? join("/tmp", "data") : join(process.cwd(), "data")
const PROJECTS_FILE = join(DATA_DIR, "projects.json")

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!existsSync(PROJECTS_FILE)) {
    // Seed with demo project on first run
    const demo = createDemoProject()
    writeFileSync(PROJECTS_FILE, JSON.stringify([demo], null, 2), "utf-8")
  } else {
    // Ensure demo project exists
    const raw = readFileSync(PROJECTS_FILE, "utf-8")
    const projects = JSON.parse(raw) as Project[]
    if (!projects.some((p) => p.id === DEMO_PROJECT_ID)) {
      projects.unshift(createDemoProject())
      writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8")
    }
  }
}

export function getAllProjects(): Project[] {
  ensureDataDir()
  const raw = readFileSync(PROJECTS_FILE, "utf-8")
  return JSON.parse(raw) as Project[]
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects()
  return projects.find((p) => p.id === id) ?? null
}

export function createProject(project: Project): Project {
  const projects = getAllProjects()
  projects.push(project)
  saveProjects(projects)
  return project
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = getAllProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null

  const updated = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  projects[index] = updated
  saveProjects(projects)
  return updated
}

export function deleteProject(id: string): boolean {
  if (id === DEMO_PROJECT_ID) return false // Demo project cannot be deleted
  const projects = getAllProjects()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length === projects.length) return false
  saveProjects(filtered)
  return true
}

function saveProjects(projects: Project[]): void {
  ensureDataDir()
  writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8")
}

export function getProjectDataDir(id: string): string {
  const dir = join(DATA_DIR, "projects", id)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

// --- Settings ---

const SETTINGS_FILE = join(DATA_DIR, "settings.json")

interface AppSettings {
  anthropicApiKey?: string
}

export function getSettings(): AppSettings {
  ensureDataDir()
  if (!existsSync(SETTINGS_FILE)) return {}
  try {
    const raw = readFileSync(SETTINGS_FILE, "utf-8")
    return JSON.parse(raw) as AppSettings
  } catch {
    return {}
  }
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const merged = { ...current, ...updates }
  ensureDataDir()
  writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8")
  return merged
}

export function getAnthropicApiKey(): string | undefined {
  // Env var takes precedence, then settings file
  return process.env.ANTHROPIC_API_KEY || getSettings().anthropicApiKey || undefined
}
