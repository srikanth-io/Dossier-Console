import { Outlet } from "react-router-dom"

import { icons, messages } from "@/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppSidebar } from "@/components/app-sidebar"

export function AppLayout() {
  return (
    <div className="flex min-h-svh">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur">
          <div className="relative w-full max-w-sm">
            <icons.search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={messages.layout.searchPlaceholder}
              className="pl-8"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={messages.common.notifications}
            >
              <icons.notifications className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-1.5">
                  <Avatar className="size-7">
                    <AvatarFallback>{messages.layout.userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{messages.layout.userName}</span>
                  <icons.chevronDown className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{messages.layout.signedInAs}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <icons.settings /> {messages.nav.items.settings}
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <icons.signOut /> {messages.layout.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
