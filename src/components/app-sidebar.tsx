import { NavLink } from "react-router-dom"

import { ROUTES, icons, messages } from "@/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
        label: messages.nav.items.templates,
        to: ROUTES.templates,
        icon: "templates",
      },
      {
        label: messages.nav.items.documents,
        to: ROUTES.documents,
        icon: "file",
      },
      {
        label: messages.nav.items.dossiers,
        to: ROUTES.resumeCreator,
        icon: "dossiers",
      },
    ],
  },
]

export function AppSidebar() {
  return (
    <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
          <icons.brand className="size-4.5" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="font-heading text-sm font-bold tracking-tight">
            {messages.nav.brand}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            {messages.nav.console}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.12em] text-sidebar-foreground/50 uppercase">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = icons[item.icon]
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
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
                          <Icon
                            className={cn(
                              "size-4 transition-colors",
                              isActive
                                ? "text-primary dark:text-zinc-300"
                                : "text-sidebar-foreground/60"
                            )}
                          />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <div className="flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-2.5 py-2.5">
          <Avatar className="size-8">
            <AvatarFallback>{messages.layout.userInitials}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
            <span className="text-sm font-semibold">
              {messages.layout.userName}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {messages.layout.userEmail}
            </span>
          </span>
        </div>
      </div>
    </aside>
  )
}
