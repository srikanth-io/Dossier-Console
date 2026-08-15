import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

import { ROUTES, icons, messages } from "@/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
      { label: messages.nav.items.templates, to: ROUTES.templates, icon: "templates" },
    ],
  },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const [signOutOpen, setSignOutOpen] = useState(false)
  return (
    <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col bg-brand-accent-soft text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 px-4">
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
                            "bg-primary font-medium text-primary-foreground shadow-sm"
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

      <div className="mt-auto p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex w-full items-center gap-2 px-2 py-2">
              <Avatar className="size-8">
                <AvatarFallback>{messages.layout.userInitials}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                <span className="text-sm font-medium">{messages.layout.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {messages.layout.userEmail}
                </span>
              </span>
              <icons.chevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="w-56">
            <DropdownMenuLabel>{messages.layout.signedInAs}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to={ROUTES.settings}>
                <icons.settings /> {messages.nav.items.settings}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setSignOutOpen(true)}
            >
              <icons.signOut /> {messages.layout.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={signOutOpen}
        onOpenChange={(open) => {
          if (!open) setSignOutOpen(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{messages.layout.signOutTitle}</DialogTitle>
            <DialogDescription>
              {messages.layout.signOutDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{messages.common.cancel}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setSignOutOpen(false)
                navigate(ROUTES.login)
              }}
            >
              <icons.signOut /> {messages.layout.signOut}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
