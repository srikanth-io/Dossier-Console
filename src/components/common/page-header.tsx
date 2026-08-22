import * as React from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = React.ComponentProps<"div"> & {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  align?: "start" | "between"
}

function PageHeader({
  className,
  eyebrow,
  title,
  description,
  actions,
  align = "between",
  ...props
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex w-full flex-col gap-4",
        align === "between"
          ? "sm:flex-row sm:items-center sm:justify-between"
          : "sm:items-start",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && (
          <span className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-[28px] sm:leading-9">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {actions}
        </div>
      )}
    </div>
  )
}

export { PageHeader }
