import { Button } from "@/components/ui/button"
import { icons, messages } from "@/constants"
import { cn } from "@/lib/utils"

type StoreBadgesProps = {
  className?: string
  inverted?: boolean
}

export function StoreBadges({
  className,
  inverted = false,
}: StoreBadgesProps) {
  const badgeClass = inverted
    ? "border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background dark:border-background/40 dark:hover:bg-background/10 [&_.caption]:text-background/60"
    : "border-foreground/20"

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button
        asChild
        variant="outline"
        className={cn("h-12 gap-3 rounded-xl px-4", badgeClass)}
      >
        <a href="#" target="_blank" rel="noreferrer">
          <icons.play className="size-6" />
          <span className="flex flex-col items-start leading-tight">
            <span className="caption text-[10px] uppercase text-muted-foreground">
              {messages.landing.download.getItOn}
            </span>
            <span className="text-sm font-semibold">
              {messages.landing.download.googlePlay}
            </span>
          </span>
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        className={cn("h-12 gap-3 rounded-xl px-4", badgeClass)}
      >
        <a href="#" target="_blank" rel="noreferrer">
          <icons.apple className="size-6" />
          <span className="flex flex-col items-start leading-tight">
            <span className="caption text-[10px] uppercase text-muted-foreground">
              {messages.landing.download.downloadOn}
            </span>
            <span className="text-sm font-semibold">
              {messages.landing.download.appStore}
            </span>
          </span>
        </a>
      </Button>
    </div>
  )
}
