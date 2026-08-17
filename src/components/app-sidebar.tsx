import { useState } from "react"
import { NavLink } from "react-router-dom"

import { ROUTES, icons, messages } from "@/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const navSections: {
  label: string
  items: {
    label: string
    to: string
    icon: keyof typeof icons
    end?: boolean
  }[]
}[] = [
  {
    label: messages.nav.sections.overview,
    items: [
      {
        label: messages.nav.items.dashboard,
        to: ROUTES.dashboard,
        icon: "dashboard",
        end: true,
      },
    ],
  },
  {
    label: messages.nav.sections.workspace,
    items: [
      {
        label: messages.nav.items.projects,
        to: ROUTES.projects,
        icon: "dossiers",
      },
      {
        label: messages.nav.items.templates,
        to: ROUTES.templates,
        icon: "templates",
      },
      {
        label: messages.nav.items.documents,
        to: ROUTES.documents,
        icon: "file",
      },
    ],
  },
]

function NavItem({
  item,
  collapsed,
}: {
  item: (typeof navSections)[number]["items"][number]
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
                  isActive
                    ? "text-primary dark:text-zinc-300"
                    : "text-sidebar-foreground/60"
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

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className="group/logo flex h-16 shrink-0 cursor-pointer items-center gap-2.5 px-4"
        onClick={() => setCollapsed((c) => !c)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setCollapsed((c) => !c)
        }}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
          <icons.brand className="size-4.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-heading text-sm font-bold tracking-tight">
              {messages.nav.brand}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {messages.nav.console}
            </p>
          </div>
        )}
        {!collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 rounded-md p-1 text-sidebar-foreground/40 opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-foreground group-hover/logo:opacity-100">
                <icons.chevronLeft className="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="sr-only">Expand sidebar</span>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.12em] text-sidebar-foreground/50 uppercase">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-2.5 py-2.5",
                collapsed && "justify-center px-0"
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback>{messages.layout.userInitials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                  <span className="text-sm font-semibold">
                    {messages.layout.userName}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {messages.layout.userEmail}
                  </span>
                </span>
              )}
            </div>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">
              <p className="font-medium">{messages.layout.userName}</p>
              <p className="text-xs text-muted-foreground">
                {messages.layout.userEmail}
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  )
}
