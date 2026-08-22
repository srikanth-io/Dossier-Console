import * as React from "react"

import { cn } from "@/lib/utils"

type EmptyStateProps = React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/30 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft/70 text-primary [&_svg]:size-6 dark:bg-primary/15">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-bold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

export { EmptyState }
