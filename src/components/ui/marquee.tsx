import { cn } from "@/lib/utils"

type MarqueeProps = {
  children: React.ReactNode
  className?: string
  pauseOnHover?: boolean
}

function Marquee({ children, className, pauseOnHover }: MarqueeProps) {
  return (
    <div
      className={cn("group relative flex overflow-hidden", className)}
    >
      <div
        className={cn(
          "flex w-max animate-marquee gap-4",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

export { Marquee }
