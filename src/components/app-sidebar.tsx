import { NavLink } from "react-router-dom"

import { APP, ROUTES, icons, messages } from "@/constants"
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
      { label: messages.nav.items.dossiers, to: ROUTES.dossiers, icon: "dossiers" },
      { label: messages.nav.items.users, to: ROUTES.users, icon: "users" },
      { label: messages.nav.items.reports, to: ROUTES.reports, icon: "reports" },
    ],
  },
  {
    label: messages.nav.sections.system,
    items: [
      { label: messages.nav.items.settings, to: ROUTES.settings, icon: "settings" },
    ],
  },
]

export function AppSidebar() {
  return (
    <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <icons.brand className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{messages.nav.brand}</p>
          <p className="text-xs text-muted-foreground">{messages.nav.console}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
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
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive &&
                            "bg-accent text-accent-foreground font-medium"
                        )
                      }
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <p className="px-2 text-xs text-muted-foreground">{APP.version}</p>
      </div>
    </aside>
  )
}
