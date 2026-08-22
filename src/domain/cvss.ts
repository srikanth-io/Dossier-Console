export type CvssVersion = "3.1"

export type SeverityBand = "none" | "low" | "medium" | "high" | "critical"

type AttackVector = "N" | "A" | "L" | "P"
type AttackComplexity = "L" | "H"
type PrivilegesRequired = "N" | "L" | "H"
type UserInteraction = "N" | "R"
type Scope = "U" | "C"
type CiaImpact = "H" | "L" | "N"

export interface CvssMetrics {
  AV: AttackVector
  AC: AttackComplexity
  PR: PrivilegesRequired
  UI: UserInteraction
  S: Scope
  C: CiaImpact
  I: CiaImpact
  A: CiaImpact
}

export interface ParsedVector {
  ok: boolean
  version: CvssVersion | null
  metrics: CvssMetrics | null
  error: string | null
}

const METRIC_KEYS = ["AV", "AC", "PR", "UI", "S", "C", "I", "A"] as const

const ALLOWED_VALUES: Record<keyof CvssMetrics, readonly string[]> = {
  AV: ["N", "A", "L", "P"],
  AC: ["L", "H"],
  PR: ["N", "L", "H"],
  UI: ["N", "R"],
  S: ["U", "C"],
  C: ["H", "L", "N"],
  I: ["H", "L", "N"],
  A: ["H", "L", "N"],
}

const AV_WEIGHT: Record<AttackVector, number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 }
const AC_WEIGHT: Record<AttackComplexity, number> = { L: 0.77, H: 0.44 }
const PR_WEIGHT_UNCHANGED: Record<PrivilegesRequired, number> = {
  N: 0.85,
  L: 0.62,
  H: 0.27,
}
const PR_WEIGHT_CHANGED: Record<PrivilegesRequired, number> = {
  N: 0.85,
  L: 0.68,
  H: 0.5,
}
const UI_WEIGHT: Record<UserInteraction, number> = { N: 0.85, R: 0.62 }
const CIA_WEIGHT: Record<CiaImpact, number> = { H: 0.56, L: 0.22, N: 0 }

/**
 * Roundup per CVSS v3.1 specification appendix A. Compensates for IEEE-754
 * rounding errors so scores match the FIRST reference implementation.
 */
function roundup(input: number): number {
  const intput = Math.round(input * 100000)
  if (intput === 0) return 0
  if (intput % 10000 === 0) {
    return intput / 100000
  }
  return (Math.floor(intput / 10000) + 1) / 10
}

export function parseVector(vector: string): ParsedVector {
  const trimmed = vector.trim()
  if (trimmed === "") {
    return { ok: false, version: null, metrics: null, error: "empty_vector" }
  }

  let rest = trimmed
  let version: CvssVersion | null = null

  const prefixMatch = /^CVSS:(\d\.\d)\//i.exec(rest)
  if (prefixMatch) {
    const declared = prefixMatch[1]
    if (declared !== "3.1") {
      return {
        ok: false,
        version: null,
        metrics: null,
        error: `unsupported_version:${declared}`,
      }
    }
    version = "3.1"
    rest = rest.slice(prefixMatch[0].length)
  } else if (/^CVSS:/i.test(rest)) {
    return { ok: false, version: null, metrics: null, error: "unsupported_version" }
  }

  const metrics: Partial<CvssMetrics> = {}
  const seen = new Set<string>()

  for (const part of rest.split("/")) {
    if (part === "") continue
    const eq = part.indexOf(":")
    if (eq <= 0) {
      return { ok: false, version, metrics: null, error: `malformed_metric:${part}` }
    }
    const key = part.slice(0, eq)
    const value = part.slice(eq + 1)
    if (!(METRIC_KEYS as readonly string[]).includes(key)) {
      return { ok: false, version, metrics: null, error: `unknown_metric:${key}` }
    }
    if (seen.has(key)) {
      return { ok: false, version, metrics: null, error: `duplicate_metric:${key}` }
    }
    seen.add(key)
    const allowed = ALLOWED_VALUES[key as keyof CvssMetrics]
    if (!allowed.includes(value)) {
      return { ok: false, version, metrics: null, error: `invalid_value:${key}:${value}` }
    }
    ;(metrics as Record<string, string>)[key] = value
  }

  const missing = METRIC_KEYS.filter((key) => !seen.has(key))
  if (missing.length > 0) {
    return {
      ok: false,
      version,
      metrics: null,
      error: `missing_metrics:${missing.join(",")}`,
    }
  }

  return { ok: true, version: version ?? "3.1", metrics: metrics as CvssMetrics, error: null }
}

export function formatVector(metrics: CvssMetrics): string {
  return `CVSS:3.1/AV:${metrics.AV}/AC:${metrics.AC}/PR:${metrics.PR}/UI:${metrics.UI}/S:${metrics.S}/C:${metrics.C}/I:${metrics.I}/A:${metrics.A}`
}

/** Qualitative severity bands per FR-1.3 (CVSS v3.1 specification §5). */
export function severityFromScore(baseScore: number): SeverityBand {
  if (baseScore <= 0) return "none"
  if (baseScore <= 3.9) return "low"
  if (baseScore <= 6.9) return "medium"
  if (baseScore <= 8.9) return "high"
  return "critical"
}

/** Base score per CVSS v3.1 specification §7.1. Derived only — never stored as editable input. */
export function computeBaseScore(metrics: CvssMetrics): number {
  const iss =
    1 -
    (1 - CIA_WEIGHT[metrics.C]) *
      (1 - CIA_WEIGHT[metrics.I]) *
      (1 - CIA_WEIGHT[metrics.A])

  const impact =
    metrics.S === "U"
      ? 6.42 * iss
      : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15)

  if (impact <= 0) return 0

  const prWeight =
    metrics.S === "U" ? PR_WEIGHT_UNCHANGED[metrics.PR] : PR_WEIGHT_CHANGED[metrics.PR]

  const exploitability =
    8.22 * AV_WEIGHT[metrics.AV] * AC_WEIGHT[metrics.AC] * prWeight * UI_WEIGHT[metrics.UI]

  const rawScore =
    metrics.S === "U" ? impact + exploitability : 1.08 * (impact + exploitability)

  return roundup(Math.min(rawScore, 10))
}

export interface CvssResult {
  version: CvssVersion
  vector: string
  baseScore: number
  severity: SeverityBand
}

/** Parse + score in one step. Returns null when the vector is invalid. */
export function scoreVector(vector: string): CvssResult | null {
  const parsed = parseVector(vector)
  if (!parsed.ok || !parsed.metrics) return null
  const baseScore = computeBaseScore(parsed.metrics)
  return {
    version: "3.1",
    vector: formatVector(parsed.metrics),
    baseScore,
    severity: severityFromScore(baseScore),
  }
}
