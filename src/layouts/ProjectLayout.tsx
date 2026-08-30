import { useEffect, useState } from "react"
import { Outlet, NavLink, useParams, Link, useLocation } from "react-router-dom"

import { ROUTES, icons, messages } from "@/constants"
import { useActiveProject } from "@/lib/active-project"
import { AppSidebar } from "@/layouts/app-sidebar"
import { NotificationPanel } from "@/components/common/notification-panel"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { ClickSpark } from "@/components/common/click-spark"
import { GlobalSearch } from "@/components/layout/global-search"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/store/notifications"
import { useProjects } from "@/store/projects"
import { cn } from "@/lib/utils"

const statusVariant: Record<string, "success" | "warning" | "info" | "default" | "destructive"> = {
  active: "success",
  completed: "info",
  onHold: "warning",
  cancelled: "destructive",
  planning: "default",
}

const tabs: { label: string; to: string; end?: boolean }[] = [
  { label: "Overview", to: "", end: true },
  { label: "Documents", to: "/documents" },
  { label: "Notes", to: "/notes" },
  { label: "Timesheet", to: "/timesheet" },
]

export function ProjectLayout() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const { getProject } = useProjects()
  const { unreadCount } = useNotifications()
  const { setActive } = useActiveProject()
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [navState, setNavState] = useState<"closed" | "hover" | "pinned">("closed")
  const [isTablet, setIsTablet] = useState(false)

  const project = getProject(id ?? "")

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (max-width: 1023.98px)")
    setIsTablet(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const navOpen = navState !== "closed"
  const handleLogoHover = () => setNavState((s) => (s === "closed" ? "hover" : s))
  const handleLogoClick = () => setNavState((s) => (s === "pinned" ? "closed" : "pinned"))
  const closeNav = () => setNavState("closed")

  const isEditor =
    /\/documents\/[^/]+$/.test(pathname) ||
    /\/notes\/[^/]+$/.test(pathname)

  useEffect(() => { closeNav() }, [pathname])

  useEffect(() => {
    if (id) setActive(id)
  }, [id, setActive])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((o) => !o)
        return
      }
      if (e.key === "Escape") closeNav()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (isEditor) {
    return (
      <ClickSpark sparkColor="currentColor" sparkSize={8} sparkRadius={12} sparkCount={6} duration={350}>
        <Outlet />
      </ClickSpark>
    )
  }

  return (
    <ClickSpark sparkColor="currentColor" sparkSize={8} sparkRadius={12} sparkCount={6} duration={350}>
      <div className="flex min-h-svh">
        <AppSidebar className="hidden md:flex" defaultCollapsed={isTablet} />

        {navOpen && (
          <div role="dialog" aria-modal="true" aria-label={messages.nav.brand} className="fixed inset-0 z-50 md:hidden">
            <div aria-hidden="true" onClick={closeNav} className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
            <div
              onMouseLeave={() => setNavState((s) => (s === "hover" ? "closed" : s))}
              className="absolute top-3 bottom-3 left-3 w-64 overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-2xl shadow-black/20 ring-1 ring-black/5 animate-fade-rise dark:shadow-black/50"
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
              className="shrink-0 md:hidden"
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
                <span className="flex-1 truncate text-left">{messages.layout.searchPlaceholder}</span>
                <kbd className="pointer-events-none hidden shrink-0 rounded border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold sm:inline-block">⌘K</kbd>
              </button>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <NotificationPanel open={notifOpen} onOpenChange={setNotifOpen}>
                <Button variant="ghost" size="icon-sm" aria-label={messages.notifications.title} className="relative">
                  <icons.notifications />
                  {unreadCount > 0 && (
                    <span aria-hidden="true" className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground ring-2 ring-background">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </NotificationPanel>
              <AnimatedThemeToggler className="size-9" />
            </div>
          </header>

          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

          <div className="border-b border-border/60 bg-background px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 py-4">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link to={ROUTES.projects} className="transition-colors hover:text-foreground">
                  {messages.projects.title}
                </Link>
                <icons.chevronRight className="size-3.5" />
                <span className="font-medium text-foreground">
                  {project?.name ?? "..."}
                </span>
              </nav>

              {/* Project header */}
              {project && (
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-xl font-bold tracking-tight">{project.name}</h1>
                  <Badge variant={statusVariant[project.status]}>
                    {messages.projects.status[project.status]}
                  </Badge>
                  {project.client && (
                    <span className="text-sm text-muted-foreground">Client: {project.client}</span>
                  )}
                </div>
              )}

              {/* Tabs */}
              <nav className="-mb-px flex gap-6">
                {tabs.map((tab) => {
                  const basePath = `/app/projects/${id}`
                  const to = tab.to ? `${basePath}${tab.to}` : basePath
                  return (
                    <NavLink
                      key={tab.label}
                      to={to}
                      end={tab.end}
                      className={({ isActive }) =>
                        cn(
                          "pb-3 text-sm font-medium transition-colors border-b-2",
                          isActive
                            ? "border-primary text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        )
                      }
                    >
                      {tab.label}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          </div>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-6 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ClickSpark>
  )
}
