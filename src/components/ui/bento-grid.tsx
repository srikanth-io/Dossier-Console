import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  )
}

type BentoCardProps = {
  name: string
  description: string
  className?: string
  background?: ReactNode
  Icon?: React.ComponentType<{ className?: string }>
  href?: string
  cta?: string
}

function BentoCard({
  name,
  description,
  className,
  background,
  Icon,
  href,
  cta,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative col-span-3 flex flex-col justify-end overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-lg/5",
        "md:col-span-1",
        className
      )}
    >
      <div>{background}</div>
      <div className="relative z-10 flex flex-col gap-1">
        {Icon && (
          <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        )}
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {href && cta && (
          <a
            href={href}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {cta}
            <span aria-hidden="true">&rarr;</span>
          </a>
        )}
      </div>
    </div>
  )
}

export { BentoGrid, BentoCard }
