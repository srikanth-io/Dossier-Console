import { cn } from "@/lib/utils"

type StatusTone =
  | "neutral"
  | "success"
  | "warning"
  | "info"
  | "danger"

type StatusKey =
  | "draft"
  | "inReview"
  | "complete"
  | "active"
  | "invited"
  | "suspended"
  | "published"
  | "archived"

const toneMap: Record<StatusKey, StatusTone> = {
  draft: "neutral",
  archived: "neutral",
  inReview: "warning",
  complete: "success",
  active: "success",
  published: "success",
  invited: "info",
  suspended: "danger",
}

const toneClasses: Record<StatusTone, string> = {
  neutral:
    "bg-muted text-muted-foreground dark:bg-muted/60",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  danger:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
}

const dotClasses: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  danger: "bg-rose-500",
}

type StatusPillProps = React.ComponentProps<"span"> & {
  label: string
  tone?: StatusTone
  status?: StatusKey
  dot?: boolean
}

function StatusPill({
  className,
  label,
  tone,
  status,
  dot = true,
  ...props
}: StatusPillProps) {
  const resolvedTone: StatusTone =
    tone ?? (status ? toneMap[status] : "neutral")

  return (
    <span
      data-slot="status-pill"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        toneClasses[resolvedTone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full", dotClasses[resolvedTone])}
        />
      )}
      {label}
    </span>
  )
}

export { StatusPill }
export type { StatusTone, StatusKey }
