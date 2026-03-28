import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { createHash } from "crypto"

const IS_VERCEL = !!process.env.VERCEL
const DATA_DIR = IS_VERCEL ? join("/tmp", "data") : join(process.cwd(), "data")
const USAGE_FILE = join(DATA_DIR, "usage.json")

const FREE_TRIAL_LIMIT = 2

interface UsageEntry {
  ip: string
  count: number
  firstUsedAt: string
  lastUsedAt: string
}

interface UsageData {
  entries: UsageEntry[]
}

function ensureFile(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!existsSync(USAGE_FILE)) {
    writeFileSync(USAGE_FILE, JSON.stringify({ entries: [] }, null, 2), "utf-8")
  }
}

function readUsage(): UsageData {
  ensureFile()
  try {
    const raw = readFileSync(USAGE_FILE, "utf-8")
    return JSON.parse(raw) as UsageData
  } catch {
    return { entries: [] }
  }
}

function saveUsage(data: UsageData): void {
  ensureFile()
  writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), "utf-8")
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex")
}

export function getUsageCount(ip: string): number {
  const data = readUsage()
  const hashed = hashIp(ip)
  const entry = data.entries.find((e) => e.ip === hashed)
  return entry?.count ?? 0
}

export function getRemainingTrials(ip: string): number {
  const used = getUsageCount(ip)
  return Math.max(0, FREE_TRIAL_LIMIT - used)
}

export function canUseFreeTrial(ip: string): boolean {
  return getRemainingTrials(ip) > 0
}

export function incrementUsage(ip: string): number {
  const data = readUsage()
  const now = new Date().toISOString()
  const hashed = hashIp(ip)
  const existing = data.entries.find((e) => e.ip === hashed)

  if (existing) {
    existing.count += 1
    existing.lastUsedAt = now
  } else {
    data.entries.push({
      ip: hashed,
      count: 1,
      firstUsedAt: now,
      lastUsedAt: now,
    })
  }

  saveUsage(data)
  return existing ? existing.count : 1
}

export const FREE_TRIAL_MAX = FREE_TRIAL_LIMIT
