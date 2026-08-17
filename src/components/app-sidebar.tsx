import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

import { ROUTES, icons, messages } from "@/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { usePages } from "@/store/pages"
import { cn } from "@/lib/utils"

const navItems: {
  label: string
  to: string
  icon: keyof typeof icons
  end?: boolean
}[] = [
  { label: messages.nav.items.dashboard, to: ROUTES.dashboard, icon: "dashboard", end: true },
  { label: messages.nav.items.templates, to: ROUTES.templates, icon: "fileCode" },
  { label: messages.nav.items.projects, to: ROUTES.projects, icon: "dossiers" },
  { label: messages.nav.items.files, to: ROUTES.documents, icon: "openFile" },
  { label: messages.nav.items.notepad, to: ROUTES.notepad, icon: "file" },
]

function NavItem({
  item,
  collapsed,
}: {
  item: (typeof navItems)[number]
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

function UserCard({ collapsed }: { collapsed: boolean }) {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = usePages()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold text-white"
            onClick={() => setOpen(true)}
          >
            {currentWorkspace.icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{currentWorkspace.name}</TooltipContent>
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
            <AvatarFallback>{messages.layout.userInitials}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
            <span className="text-sm font-semibold">
              {messages.layout.userName}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {currentWorkspace.name}
            </span>
          </span>
          <icons.chevronDown className="size-3.5 shrink-0 text-sidebar-foreground/40" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" sideOffset={4} className="w-64 p-1.5">
        <p className="px-2 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Account
        </p>
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">{messages.layout.userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium truncate">{messages.layout.userName}</span>
            <span className="text-[11px] text-muted-foreground truncate">{messages.layout.userEmail}</span>
          </div>
        </div>
        <div className="mt-1 border-t border-border/50 pt-1">
          <p className="px-2 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Workspace
          </p>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => {
                setCurrentWorkspace(ws.id)
                setOpen(false)
                navigate(ROUTES.notepad)
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent",
                ws.id === currentWorkspace.id && "bg-primary/5"
              )}
            >
              <span className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                ws.id === currentWorkspace.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {ws.icon}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cn(
                  "text-sm font-medium truncate",
                  ws.id === currentWorkspace.id && "text-primary"
                )}>
                  {ws.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {ws.pageCount} pages
                </span>
              </span>
              {ws.id === currentWorkspace.id && (
                <icons.check className="size-3.5 shrink-0 text-primary" />
              )}
            </button>
          ))}
          <div className="mt-1 border-t border-border/50 pt-1">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <icons.plus className="size-3.5" />
              Connect workspace
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 glass",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="group/logo flex h-14 shrink-0 items-center gap-2.5 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-glow">
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
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.to + item.label} item={item} collapsed={collapsed} />
          ))}
        </ul>
      </nav>

      <div className="p-3">
        <UserCard collapsed={collapsed} />
      </div>
    </aside>
  )
}
