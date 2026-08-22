import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { ROUTES, icons, messages } from "@/constants"
import { AppSidebar } from "@/layouts/app-sidebar"
import { NotificationBanner } from "@/components/common/notification-banner"
import { NotificationPanel } from "@/components/common/notification-panel"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNotifications } from "@/store/notifications"

export function AppLayout() {
  const { pathname } = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const { unreadCount } = useNotifications()

  const isFullscreen =
    pathname === ROUTES.resumeCreator || pathname === ROUTES.studioEditor

  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <NotificationBanner />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background px-6">
          <div className="relative w-full max-w-sm">
            <icons.search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={messages.layout.searchPlaceholder}
              className="h-8.5 bg-card/70 pl-9 text-[0.8125rem] shadow-none dark:bg-input/20"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <NotificationPanel open={notifOpen} onOpenChange={setNotifOpen}>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={messages.notifications.title}
                className="relative"
              >
                <icons.notifications />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground ring-2 ring-background"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </NotificationPanel>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1">
          {isFullscreen ? (
            <Outlet />
          ) : (
            <div className="mx-auto w-full max-w-7xl px-6 py-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
