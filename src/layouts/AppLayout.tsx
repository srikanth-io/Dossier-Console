import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"

import { ROUTES, commonMessages, icons, messages } from "@/constants"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AppLayout() {
  const navigate = useNavigate()
  const [signOutOpen, setSignOutOpen] = useState(false)

  return (
    <div className="flex min-h-svh">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-6 backdrop-blur-xl">
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={messages.common.notifications}
                  className="relative"
                >
                  <icons.notifications />
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {messages.common.notifications}
              </TooltipContent>
            </Tooltip>

            <ThemeToggle />

            <Separator
              orientation="vertical"
              className="mx-1.5 h-5"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full p-0"
                  aria-label={commonMessages.account}
                >
                  <Avatar className="size-8">
                    <AvatarFallback>
                      {messages.layout.userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-2 py-2">
                  <p className="text-sm font-semibold">
                    {messages.layout.userName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {messages.layout.userEmail}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{messages.layout.signedInAs}</DropdownMenuLabel>
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
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Dialog
        open={signOutOpen}
        onOpenChange={(open) => {
          if (!open) setSignOutOpen(false)
        }}
      >
        <DialogContent className="max-w-md">
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
    </div>
  )
}
