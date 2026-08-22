import { cva, type VariantProps } from "class-variance-authority"
import {
  CircleAlert,
  CircleMinus,
  Info,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import { forwardRef } from "react"

import { messages } from "@/constants"
import type { SeverityBand } from "@/domain/cvss"
import { severityFromScore } from "@/domain/cvss"
import { cn } from "@/lib/utils"

/** Visual tiers. `none` is a CVSS band; `info` is the informational tier used by reports. */
export type SeverityTier = "critical" | "high" | "medium" | "low" | "none" | "info"

const severityBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
  {
    variants: {
      tier: {
        critical: "border-severity-critical-border bg-severity-critical-bg text-severity-critical-fg",
        high: "border-severity-high-border bg-severity-high-bg text-severity-high-fg",
        medium: "border-severity-medium-border bg-severity-medium-bg text-severity-medium-fg",
        low: "border-severity-low-border bg-severity-low-bg text-severity-low-fg",
        none: "border-severity-info-border bg-severity-info-bg text-severity-info-fg",
        info: "border-severity-info-border bg-severity-info-bg text-severity-info-fg",
      },
      variant: {
        solid: "",
        soft: "",
        outline: "bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px] leading-4 [&_svg]:size-3",
        md: "px-2.5 py-1 text-xs leading-4 [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "soft",
      size: "md",
    },
    compoundVariants: [
      { variant: "solid", tier: "critical", className: "bg-severity-critical-fg text-severity-critical-bg border-severity-critical-fg" },
      { variant: "solid", tier: "high", className: "bg-severity-high-fg text-severity-high-bg border-severity-high-fg" },
      { variant: "solid", tier: "medium", className: "bg-severity-medium-fg text-severity-medium-bg border-severity-medium-fg" },
      { variant: "solid", tier: "low", className: "bg-severity-low-fg text-severity-low-bg border-severity-low-fg" },
      { variant: "solid", tier: "none", className: "bg-severity-info-fg text-severity-info-bg border-severity-info-fg" },
      { variant: "solid", tier: "info", className: "bg-severity-info-fg text-severity-info-bg border-severity-info-fg" },
    ],
  }
)

const TIER_ICONS: Record<SeverityTier, LucideIcon> = {
  critical: OctagonAlert,
  high: TriangleAlert,
  medium: CircleAlert,
  low: CircleMinus,
  none: Info,
  info: Info,
}

const TIER_LABELS: Record<SeverityTier, string> = {
  critical: messages.findings.severity.critical,
  high: messages.findings.severity.high,
  medium: messages.findings.severity.medium,
  low: messages.findings.severity.low,
  none: messages.findings.severity.none,
  info: messages.findings.severity.info,
}

function formatScore(score: number): string {
  return Number.isInteger(score) ? score.toFixed(1) : String(score)
}

export interface SeverityBadgeProps {
  /** Raw CVSS base score. Band is derived here — the only mapping allowed (§4.3.4). */
  score?: number
  /** Pre-derived band from `severityFromScore`/`scoreVector`, or the informational tier. */
  band?: SeverityBand | "info"
  /** Business-context override; renders visibly as an override (FR-1.4). */
  override?: SeverityBand | null
  showScore?: boolean
  variant?: VariantProps<typeof severityBadgeVariants>["variant"]
  size?: VariantProps<typeof severityBadgeVariants>["size"]
  className?: string
  "data-testid"?: string
}

export const SeverityBadge = forwardRef<HTMLSpanElement, SeverityBadgeProps>(
  (
    { score, band, override, showScore = false, variant, size, className },
    ref
  ) => {
    if (score === undefined && band === undefined) {
      throw new Error("SeverityBadge requires `score` or a derived `band`")
    }

    const derived: SeverityBand =
      score !== undefined ? severityFromScore(score) : (band as SeverityBand)
    const effective: SeverityTier = override ?? derived

    const Icon = TIER_ICONS[effective]
    const label = TIER_LABELS[effective]

    return (
      <span
        ref={ref}
        data-testid="severity-badge"
        data-band={effective}
        data-derived-band={derived}
        title={
          override && override !== derived
            ? `${messages.findings.severity.overrideAriaPrefix} ${TIER_LABELS[derived]} ${messages.findings.severity.to} ${label}`
            : undefined
        }
        className={cn(severityBadgeVariants({ tier: effective, variant, size }), className)}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
        {showScore && score !== undefined && (
          <span className="font-mono opacity-80">
            {messages.findings.severity.scoreLabel} {formatScore(score)}
          </span>
        )}
      </span>
    )
  }
)

SeverityBadge.displayName = "SeverityBadge"
