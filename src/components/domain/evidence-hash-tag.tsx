import { forwardRef } from "react"

import { cn } from "@/lib/utils"

export interface EvidenceHashTagProps {
  sha256: string
  truncate?: boolean
  className?: string
  "data-testid"?: string
}

function shorten(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`
}

/** SHA-256 chip recorded at upload for evidentiary integrity (PRD FR-4.5). */
export const EvidenceHashTag = forwardRef<HTMLSpanElement, EvidenceHashTagProps>(
  ({ sha256, truncate = true, className }, ref) => {
    return (
      <span
        ref={ref}
        data-testid="evidence-hash-tag"
        title={sha256}
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] leading-4 text-muted-foreground",
          className
        )}
      >
        <span aria-hidden="true">#</span>
        <span className="truncate">{truncate ? shorten(sha256) : sha256}</span>
      </span>
    )
  }
)

EvidenceHashTag.displayName = "EvidenceHashTag"
