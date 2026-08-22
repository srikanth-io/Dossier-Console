import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { commonMessages, icons, messages } from "@/constants"
import { useNotifications } from "@/store/notifications"
import { cn } from "@/lib/utils"
import type { NotificationType } from "@/data/notifications"

const typeStyles: Record<NotificationType, { dot: string; bg: string }> = {
  info: {
    dot: "bg-sky-500",
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  success: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    dot: "bg-amber-500",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  error: {
    dot: "bg-red-500",
    bg: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
}

type NotificationPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function NotificationPanel({ open, onOpenChange, children }: NotificationPanelProps) {
  const { notifications, unreadCount, markRead, markAllRead, clear, clearAll } = useNotifications()
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[420px] max-h-[520px] p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">
              {messages.notifications.title}
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllRead}
              >
                <icons.check className="size-3" />
                {messages.notifications.markAllRead}
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={clearAll}
              >
                <icons.trash className="size-3" />
                {messages.notifications.clearAll}
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-1 px-4 pb-2">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f === "all" ? messages.notifications.all : messages.notifications.unread}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1 text-[10px]">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>

        <Separator />

        <div className="max-h-[380px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <icons.notifications className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {filter === "unread"
                  ? messages.notifications.allRead
                  : messages.notifications.empty}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "group flex gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                    !n.read && "bg-primary/[0.03]"
                  )}
                  onClick={() => markRead(n.id)}
                >
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      typeStyles[n.type].dot
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !n.read ? "font-semibold" : "font-medium"
                        )}
                      >
                        {n.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          clear(n.id)
                        }}
                        aria-label={commonMessages.close}
                      >
                        <icons.close className="size-3" />
                      </Button>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {n.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/70">
                      <span>{n.timestamp}</span>
                      {n.screen && (
                        <>
                          <span>·</span>
                          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", typeStyles[n.type].bg)}>
                            {n.screen}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
