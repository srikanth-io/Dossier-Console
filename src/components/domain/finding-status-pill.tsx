import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { messages } from "@/constants"
import type { FindingStatus } from "@/domain/model"
import { cn } from "@/lib/utils"

const findingStatusPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-4 whitespace-nowrap",
  {
    variants: {
      status: {
        draft: "bg-muted text-status-draft",
        in_review: "bg-muted text-status-in-review",
        changes_requested: "bg-muted text-status-changes-requested",
        approved: "bg-muted text-status-approved",
        remediated: "bg-muted text-status-approved",
        risk_accepted: "bg-muted text-status-risk-accepted",
        false_positive: "bg-muted text-status-false-positive",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px] [&_svg]:size-3",
        md: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const STATUS_LABELS: Record<FindingStatus, string> = {
  draft: messages.findings.status.draft,
  in_review: messages.findings.status.in_review,
  changes_requested: messages.findings.status.changes_requested,
  approved: messages.findings.status.approved,
  remediated: messages.findings.status.remediated,
  risk_accepted: messages.findings.status.risk_accepted,
  false_positive: messages.findings.status.false_positive,
}

export interface FindingStatusPillProps
  extends VariantProps<typeof findingStatusPillVariants> {
  status: FindingStatus
  className?: string
  "data-testid"?: string
}

export const FindingStatusPill = forwardRef<HTMLSpanElement, FindingStatusPillProps>(
  ({ status, size, className }, ref) => {
    return (
      <span
        ref={ref}
        data-testid="finding-status-pill"
        data-status={status}
        className={cn(findingStatusPillVariants({ status, size }), className)}
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        {STATUS_LABELS[status]}
      </span>
    )
  }
)

FindingStatusPill.displayName = "FindingStatusPill"
