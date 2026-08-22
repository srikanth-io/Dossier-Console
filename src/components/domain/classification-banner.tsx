import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { messages } from "@/constants"
import type { Confidentiality } from "@/domain/model"
import { cn } from "@/lib/utils"

const classificationBannerVariants = cva(
  "flex items-center justify-center gap-2 border-y px-4 py-1 text-[11px] font-bold tracking-widest uppercase",
  {
    variants: {
      classification: {
        internal: "border-border bg-muted/50 text-classification-internal",
        confidential: "border-status-risk-accepted/40 bg-warning/10 text-classification-confidential",
        restricted: "border-destructive/40 bg-destructive/10 text-classification-restricted",
      },
    },
    defaultVariants: {
      classification: "confidential",
    },
  }
)

const CLASSIFICATION_LABELS: Record<Confidentiality, string> = {
  internal: messages.findings.classification.internal,
  confidential: messages.findings.classification.confidential,
  restricted: messages.findings.classification.restricted,
}

export interface ClassificationBannerProps
  extends VariantProps<typeof classificationBannerVariants> {
  clientName?: string
  className?: string
  "data-testid"?: string
}

export const ClassificationBanner = forwardRef<
  HTMLDivElement,
  ClassificationBannerProps
>(({ classification, clientName, className }, ref) => {
  return (
    <div
      ref={ref}
      data-testid="classification-banner"
      data-classification={classification}
      role="note"
      className={cn(classificationBannerVariants({ classification }), className)}
    >
      <span aria-hidden="true">■</span>
      <span>
        {CLASSIFICATION_LABELS[classification ?? "confidential"]}
        {clientName ? ` — ${clientName}` : ""}
      </span>
      <span aria-hidden="true">■</span>
    </div>
  )
})

ClassificationBanner.displayName = "ClassificationBanner"
