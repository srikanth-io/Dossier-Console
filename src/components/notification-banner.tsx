import { useEffect, useRef, useState } from "react"

import { icons } from "@/constants"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/store/notifications"
import type { NotificationType } from "@/data/notifications"
import { cn } from "@/lib/utils"

const typeStyles: Record<NotificationType, { icon: React.ReactNode }> = {
  info: { icon: <icons.notifications className="size-4 text-sky-500" /> },
  success: { icon: <icons.checkCircle className="size-4 text-emerald-500" /> },
  warning: { icon: <icons.alertCircle className="size-4 text-amber-500" /> },
  error: { icon: <icons.alertCircle className="size-4 text-red-500" /> },
}

const DISMISS_MS = 6000

export function NotificationBanner() {
  const { notifications } = useNotifications()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<(typeof notifications)[number] | null>(null)
  const prevCountRef = useRef(notifications.length)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (notifications.length > prevCountRef.current) {
      const newest = notifications[0]
      setCurrent(newest)
      setVisible(true)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setVisible(false)
      }, DISMISS_MS)
    }
    prevCountRef.current = notifications.length
  }, [notifications])

  if (!visible || !current) return null

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[9999]">
      <div
        className={cn(
          "pointer-events-auto flex w-[360px] items-start gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-lg backdrop-blur-sm",
          "ring-1 ring-border/30 animate-fade-rise"
        )}
      >
        <span className="mt-0.5 shrink-0">
          {typeStyles[current.type].icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{current.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {current.message}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span>{current.timestamp}</span>
            {current.screen && (
              <>
                <span>·</span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {current.screen}
                </span>
              </>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0"
          onClick={() => setVisible(false)}
        >
          <icons.close className="size-3" />
        </Button>
      </div>
    </div>
  )
}
