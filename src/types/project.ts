export interface Project {
  id: string
  url: string
  name: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
  clone: CloneState
  analysis: AnalysisState
  enhanced: EnhancedState
}

export interface CloneState {
  status: PipelineStatus
  progress: number
  logs: LogEntry[]
  outputDir?: string
  previewUrl?: string
  screenshotDesktop?: string
  screenshotMobile?: string
  extractedData?: ExtractedSiteData
  error?: string
}

export interface AnalysisState {
  status: PipelineStatus
  suggestions: Suggestion[]
  error?: string
}

export interface EnhancedState {
  status: PipelineStatus
  appliedSuggestionIds: string[]
  outputDir?: string
  previewUrl?: string
  enhancedHtml?: string
  error?: string
}

export type PipelineStatus = "idle" | "analyzing" | "building" | "done" | "error"

export interface Suggestion {
  id: string
  category: SuggestionCategory
  priority: "high" | "medium" | "low"
  title: string
  description: string
  currentState: string
  suggestedState: string
  effort: "easy" | "medium" | "hard"
  applied: boolean
}

export type SuggestionCategory =
  | "ux"
  | "performance"
  | "accessibility"
  | "modern-patterns"
  | "design"
  | "seo"

export interface LogEntry {
  timestamp: string
  phase: string
  message: string
  level: "info" | "warn" | "error"
}

export interface ExtractedSiteData {
  title?: string
  description?: string
  fonts: string[]
  colors: string[]
  images: string[]
  headings: string[]
  links: string[]
  techStack: string[]
}

export function createEmptyProject(id: string, url: string): Project {
  const hostname = new URL(url).hostname.replace("www.", "")
  return {
    id,
    url,
    name: hostname,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clone: {
      status: "idle",
      progress: 0,
      logs: [],
    },
    analysis: {
      status: "idle",
      suggestions: [],
    },
    enhanced: {
      status: "idle",
      appliedSuggestionIds: [],
    },
  }
}
