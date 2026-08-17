import * as React from "react"

import { cn } from "@/lib/utils"

type StatCardProps = React.ComponentProps<"div"> & {
  title: string
  value: string
  icon?: React.ReactNode
  iconTone?: "primary" | "success" | "warning" | "info"
  hint?: string
  delta?: string
  trend?: "up" | "down" | "neutral"
}

const iconToneClasses: Record<NonNullable<StatCardProps["iconTone"]>, string> = {
  primary: "bg-primary-soft/70 text-primary dark:bg-primary/15",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  info: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
}

function StatCard({
  className,
  title,
  value,
  icon,
  iconTone = "primary",
  hint,
  delta,
  trend = "neutral",
  ...props
}: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "group/card flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        {icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/card:scale-105 [&_svg]:size-[18px]",
              iconToneClasses[iconTone]
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-[28px] sm:leading-9">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              trend === "up" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
              trend === "down" && "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {hint && (
        <span className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  )
}

export { StatCard }
