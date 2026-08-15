import { Outlet } from "react-router-dom"

import { icons, messages } from "@/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppSidebar } from "@/components/app-sidebar"

export function AppLayout() {
  return (
    <div className="flex min-h-svh">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 bg-brand-accent-soft px-6 backdrop-blur">
          <div className="mx-auto flex w-full max-w-2xl justify-center">
            <div className="relative w-full">
              <icons.search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={messages.layout.searchPlaceholder}
                className="w-full pl-9"
              />
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={messages.common.notifications}
            >
              <icons.notifications className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <div className="w-full px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
