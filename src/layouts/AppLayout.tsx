import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { ROUTES, icons, messages } from "@/constants"
import { AppSidebar } from "@/layouts/app-sidebar"
import { NotificationBanner } from "@/components/common/notification-banner"
import { NotificationPanel } from "@/components/common/notification-panel"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { GlobalSearch } from "@/components/layout/global-search"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/store/notifications"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const { pathname } = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [navState, setNavState] = useState<"closed" | "hover" | "pinned">("closed")
  const { unreadCount } = useNotifications()

  const navOpen = navState !== "closed"

  const handleLogoHover = () => {
    setNavState((state) => (state === "closed" ? "hover" : state))
  }

  const handleLogoClick = () => {
    setNavState((state) => (state === "pinned" ? "closed" : "pinned"))
  }

  const closeNav = () => setNavState("closed")

  const isFullscreen =
    pathname === ROUTES.resumeCreator || pathname === ROUTES.studioEditor

  // Close the floating navigation when the route changes or Escape is pressed.
  useEffect(() => {
    closeNav()
  }, [pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((open) => !open)
        return
      }
      if (e.key === "Escape") closeNav()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex min-h-svh">
      <AppSidebar className="hidden lg:flex" />
      <NotificationBanner />

      {navOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={messages.nav.brand}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            aria-hidden="true"
            onClick={closeNav}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          <div
            onMouseLeave={() =>
              setNavState((state) => (state === "hover" ? "closed" : state))
            }
            className={cn(
              "absolute top-3 bottom-3 left-3 w-64 overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-2xl shadow-black/20 ring-1 ring-black/5 animate-fade-rise dark:shadow-black/50"
            )}
          >
            <AppSidebar floating />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={navOpen ? messages.layout.closeNavigation : messages.layout.openNavigation}
            aria-expanded={navOpen}
            className="shrink-0 lg:hidden"
            onMouseEnter={handleLogoHover}
            onClick={handleLogoClick}
          >
            <icons.brand />
          </Button>

          <div className="flex min-w-0 flex-1 justify-center">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={messages.layout.searchPlaceholder}
              className="flex h-8.5 w-full max-w-md items-center gap-2.5 rounded-lg border border-border/60 bg-card/70 px-3 text-[0.8125rem] text-muted-foreground shadow-none transition-colors hover:bg-muted/60 dark:bg-input/20 dark:hover:bg-input/30"
            >
              <icons.search className="size-4 shrink-0" />
              <span className="flex-1 truncate text-left">
                {messages.layout.searchPlaceholder}
              </span>
              <kbd className="pointer-events-none hidden shrink-0 rounded border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold sm:inline-block">
                ⌘K
              </kbd>
            </button>
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

        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

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
