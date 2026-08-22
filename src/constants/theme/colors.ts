export const colors = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
  popover: "var(--popover)",
  popoverForeground: "var(--popover-foreground)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  primarySoft: "var(--primary-soft)",
  secondary: "var(--secondary)",
  secondaryForeground: "var(--secondary-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  info: "var(--info)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  scrim: "var(--scrim)",
  sidebar: "var(--sidebar)",
  sidebarForeground: "var(--sidebar-foreground)",
  sidebarPrimary: "var(--sidebar-primary)",
  sidebarPrimaryForeground: "var(--sidebar-primary-foreground)",
  sidebarAccent: "var(--sidebar-accent)",
  sidebarAccentForeground: "var(--sidebar-accent-foreground)",
  sidebarBorder: "var(--sidebar-border)",
  sidebarRing: "var(--sidebar-ring)",
  brandAccent: "var(--brand-accent)",
  brandAccentSoft: "var(--brand-accent-soft)",
} as const

export const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
] as const

/**
 * Tier 3 — domain semantic tokens (docs/ui-architecture.md §4.2).
 * These reference CSS custom properties; they never duplicate values.
 */
export const severityTokens = {
  critical: { bg: "var(--severity-critical-bg)", fg: "var(--severity-critical-fg)", border: "var(--severity-critical-border)" },
  high: { bg: "var(--severity-high-bg)", fg: "var(--severity-high-fg)", border: "var(--severity-high-border)" },
  medium: { bg: "var(--severity-medium-bg)", fg: "var(--severity-medium-fg)", border: "var(--severity-medium-border)" },
  low: { bg: "var(--severity-low-bg)", fg: "var(--severity-low-fg)", border: "var(--severity-low-border)" },
  info: { bg: "var(--severity-info-bg)", fg: "var(--severity-info-fg)", border: "var(--severity-info-border)" },
} as const

export const severityPrintTokens = {
  critical: { bg: "var(--severity-critical-print-bg)", fg: "var(--severity-critical-print-fg)", border: "var(--severity-critical-print-border)" },
  high: { bg: "var(--severity-high-print-bg)", fg: "var(--severity-high-print-fg)", border: "var(--severity-high-print-border)" },
  medium: { bg: "var(--severity-medium-print-bg)", fg: "var(--severity-medium-print-fg)", border: "var(--severity-medium-print-border)" },
  low: { bg: "var(--severity-low-print-bg)", fg: "var(--severity-low-print-fg)", border: "var(--severity-low-print-border)" },
  info: { bg: "var(--severity-info-print-bg)", fg: "var(--severity-info-print-fg)", border: "var(--severity-info-print-border)" },
} as const

export const statusTokens = {
  draft: "var(--status-draft)",
  inReview: "var(--status-in-review)",
  changesRequested: "var(--status-changes-requested)",
  approved: "var(--status-approved)",
  remediated: "var(--status-remediated)",
  riskAccepted: "var(--status-risk-accepted)",
  falsePositive: "var(--status-false-positive)",
} as const

export const classificationTokens = {
  internal: "var(--classification-internal)",
  confidential: "var(--classification-confidential)",
  restricted: "var(--classification-restricted)",
} as const

export const redactionTokens = {
  flagged: "var(--redaction-flagged)",
  applied: "var(--redaction-applied)",
} as const

export const gradientBrand = "linear-gradient(135deg, #1e1b4b, #312e81)"

export const shadows = {
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  glow: "var(--shadow-glow)",
} as const
