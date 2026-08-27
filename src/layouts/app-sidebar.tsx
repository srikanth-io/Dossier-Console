import { useEffect, useState, useCallback } from "react"
import { NavLink, useNavigate, useParams } from "react-router-dom"

import { ROUTES, icons, messages } from "@/constants"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/store/auth"
import { useProjects } from "@/store/projects"
import { getStoredAvatar, onAvatarChanged } from "@/lib/avatar"
import { cn } from "@/lib/utils"

function initialsOf(name: string, fallback: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return fallback
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type NavItem = {
  label: string
  to: string
  icon: keyof typeof icons
  end?: boolean
}

function NavItem({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-primary-soft/70 font-semibold text-primary dark:bg-primary/15 dark:text-zinc-300"
            : "text-sidebar-foreground/75"
        )
      }
    >
      {({ isActive }) => (
        <>
          {!collapsed && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-foreground to-muted-foreground transition-opacity duration-150",
                isActive ? "opacity-100" : "opacity-0"
              )}
            />
          )}
          {(() => {
            const Icon = icons[item.icon]
            return (
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive ? "text-primary dark:text-zinc-300" : "text-sidebar-foreground/60"
                )}
              />
            )
          })()}
          {!collapsed && item.label}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </li>
    )
  }
  return <li>{link}</li>
}

function ProjectTree({ collapsed }: { collapsed: boolean }) {
  const { id: activeProjectId } = useParams<{ id: string }>()
  const { projects } = useProjects()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  // Auto-expand the active project
  useEffect(() => {
    if (activeProjectId) {
      setExpanded((prev) => new Set([...prev, activeProjectId]))
    }
  }, [activeProjectId])

  const toggleExpand = useCallback((projectId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }, [])

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={ROUTES.projects}
              end
              className={({ isActive }) =>
                cn(
                  "flex h-9 items-center justify-center rounded-lg px-0 transition-all duration-150 hover:bg-sidebar-accent",
                  isActive
                    ? "bg-primary-soft/70 font-semibold text-primary dark:bg-primary/15 dark:text-zinc-300"
                    : "text-sidebar-foreground/75"
                )
              }
            >
              <icons.dossiers className="size-4 shrink-0" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Projects</TooltipContent>
        </Tooltip>
      </li>
    )
  }

  return (
    <li>
      <NavLink
        to={ROUTES.projects}
        end
        className={({ isActive }) =>
          cn(
            "relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive
              ? "bg-primary-soft/70 font-semibold text-primary dark:bg-primary/15 dark:text-zinc-300"
              : "text-sidebar-foreground/75"
          )
        }
      >
        {({ isActive }) => (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-foreground to-muted-foreground transition-opacity duration-150",
                isActive ? "opacity-100" : "opacity-0"
              )}
            />
            <icons.dossiers className={cn(
              "size-4 shrink-0 transition-colors",
              isActive ? "text-primary dark:text-zinc-300" : "text-sidebar-foreground/60"
            )} />
            <span className="flex-1">Projects</span>
          </>
        )}
      </NavLink>

      {projects.length > 0 && (
        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border/50 pl-3">
          {projects.slice(0, 10).map((project) => {
            const isExpanded = expanded.has(project.id)
            const isProjectActive = activeProjectId === project.id
            const ProjectIcon = icons[project.icon]

            return (
              <li key={project.id}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleExpand(project.id)}
                    className="flex size-5 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent"
                  >
                    <icons.chevronRight
                      className={cn(
                        "size-3 transition-transform duration-150",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                  <NavLink
                    to={`${ROUTES.projects}/${project.id}`}
                    className={cn(
                      "flex flex-1 items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors hover:bg-sidebar-accent",
                      isProjectActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-sidebar-foreground/70"
                    )}
                  >
                    <ProjectIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </NavLink>
                </div>

                {isExpanded && (
                  <ul className="ml-4 space-y-0.5 border-l border-sidebar-border/50 pl-3">
                    {[
                      { label: messages.nav.projectTree.documents, icon: "fileCode" as const, path: `${ROUTES.projects}/${project.id}/documents` },
                      { label: messages.nav.projectTree.notes, icon: "file" as const, path: `${ROUTES.projects}/${project.id}/notes` },
                      { label: messages.nav.projectTree.timesheet, icon: "pendingReviews" as const, path: `${ROUTES.projects}/${project.id}/timesheet` },
                    ].map((sub) => (
                      <li key={sub.path}>
                        <NavLink
                          to={sub.path}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-md px-2 py-1 text-[12px] transition-colors hover:bg-sidebar-accent",
                              isActive
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-sidebar-foreground/60"
                            )
                          }
                        >
                          {(() => {
                            const SubIcon = icons[sub.icon]
                            return <SubIcon className="size-3 shrink-0" />
                          })()}
                          <span>{sub.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => navigate(ROUTES.projects)}
        className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground/75"
      >
        <icons.plus className="size-3" />
        {messages.nav.projectTree.newProject}
      </button>
    </li>
  )
}

function UserCard({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const displayName = user?.name || messages.layout.userName
  const displayInitials = initialsOf(displayName, messages.layout.userInitials)

  const [avatar, setAvatar] = useState<string | null>(() => getStoredAvatar(user?.id))

  useEffect(() => {
    const sync = () => setAvatar(getStoredAvatar(user?.id))
    sync()
    return onAvatarChanged(sync)
  }, [user?.id])

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold"
            onClick={() => setOpen(true)}
          >
            {displayInitials}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{displayName}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-2.5 py-2.5 transition-colors hover:bg-sidebar-accent"
        >
          <Avatar className="size-8 shrink-0">
            {avatar && <AvatarImage src={avatar} alt={displayName} />}
            <AvatarFallback>{displayInitials}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
            <span className="text-sm font-semibold">
              {displayName}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {user?.email || messages.layout.userEmail}
            </span>
          </span>
          <icons.chevronDown className="size-3.5 shrink-0 text-sidebar-foreground/40" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" sideOffset={4} className="w-64 p-1.5">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <div className="mt-1 border-t border-border/50 pt-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate(ROUTES.settings)
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <icons.settings className="size-3.5" />
            Settings
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type AppSidebarProps = {
  className?: string
  floating?: boolean
  defaultCollapsed?: boolean
}

export function AppSidebar({ className, floating = false, defaultCollapsed = false }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  useEffect(() => {
    setCollapsed(defaultCollapsed)
  }, [defaultCollapsed])

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
        floating ? "h-full" : "sticky top-0 h-svh border-r border-sidebar-border",
        className
      )}
    >
      <div className="group/logo flex h-14 shrink-0 items-center gap-2.5 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <icons.brand className="size-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-heading text-sm font-bold tracking-tight">
              {messages.nav.brand}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="shrink-0 rounded-md p-1 text-sidebar-foreground/40 opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-foreground group-hover/logo:opacity-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <icons.chevronRight className="size-4" /> : <icons.chevronLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {!collapsed && (
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            {messages.nav.sections.main}
          </p>
        )}
        <ul className="space-y-0.5">
          <NavItem
            item={{ label: messages.nav.items.dashboard, to: ROUTES.dashboard, icon: "dashboard", end: true }}
            collapsed={collapsed}
          />
          <ProjectTree collapsed={collapsed} />
        </ul>

        {!collapsed && (
          <>
            <div className="mx-auto my-3 h-px w-4 bg-sidebar-border/50" />
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {messages.nav.sections.work}
            </p>
          </>
        )}
        {collapsed && <div className="mx-auto my-2 h-px w-4 bg-sidebar-border/50" />}
        <ul className="space-y-0.5">
          <NavItem
            item={{ label: messages.nav.items.manager, to: ROUTES.resumes, icon: "openFile" }}
            collapsed={collapsed}
          />
          <NavItem
            item={{ label: messages.nav.items.builder, to: ROUTES.resumeBuilder, icon: "fileCode" }}
            collapsed={collapsed}
          />
        </ul>
      </nav>

      <div className="p-3">
        <UserCard collapsed={collapsed} />
      </div>
    </aside>
  )
}
