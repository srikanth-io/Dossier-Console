import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "@/lib/utils"

const environmentBadgeVariants = cva(
  "inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase leading-4 tracking-wide",
  {
    variants: {
      environment: {
        prod: "bg-severity-critical-bg text-severity-critical-fg",
        staging: "bg-severity-high-bg text-severity-high-fg",
        uat: "bg-severity-medium-bg text-severity-medium-fg",
        dev: "bg-severity-info-bg text-severity-info-fg",
      },
    },
    defaultVariants: {
      environment: "dev",
    },
  }
)

export interface EnvironmentBadgeProps
  extends VariantProps<typeof environmentBadgeVariants> {
  className?: string
  "data-testid"?: string
}

export const EnvironmentBadge = forwardRef<HTMLSpanElement, EnvironmentBadgeProps>(
  ({ environment, className }, ref) => {
    return (
      <span
        ref={ref}
        data-testid="environment-badge"
        data-environment={environment}
        className={cn(environmentBadgeVariants({ environment }), className)}
      >
        {environment ?? "dev"}
      </span>
    )
  }
)

EnvironmentBadge.displayName = "EnvironmentBadge"
