import { forwardRef } from "react"

import { cn } from "@/lib/utils"

export interface FindingIdTagProps {
  displayId: string
  className?: string
  "data-testid"?: string
}

/**
 * Immutable finding display ID (e.g. ACME-WEB-F-007). Monospace, never editable,
 * never renumbered — PRD §5.4.
 */
export const FindingIdTag = forwardRef<HTMLSpanElement, FindingIdTagProps>(
  ({ displayId, className }, ref) => {
    return (
      <span
        ref={ref}
        data-testid="finding-id-tag"
        className={cn(
          "inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[11px] leading-4 tracking-tight text-muted-foreground",
          className
        )}
      >
        {displayId}
      </span>
    )
  }
)

FindingIdTag.displayName = "FindingIdTag"
