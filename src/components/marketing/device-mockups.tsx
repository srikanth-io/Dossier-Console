import { Badge } from "@/components/ui/badge"
import { icons } from "@/constants"
import { dashboardStats, recentDossiers } from "@/data/dashboard"
import { landingPreview } from "@/data/landing"
import { getStatusBadgeVariant } from "@/lib/status"
import { cn } from "@/lib/utils"

function BrowserChrome() {
  return (
    <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
      <span className="flex gap-1.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
      </span>
      <div className="mx-auto flex items-center gap-1.5 rounded-md bg-muted px-4 py-1 text-xs text-muted-foreground">
        <icons.lock className="size-3.5" />
        {landingPreview.url}
      </div>
    </div>
  )
}

function SidebarPreview() {
  return (
    <aside className="hidden w-1/4 shrink-0 space-y-2.5 border-r bg-muted/30 p-3 sm:block">
      <div className="mb-2.5 flex items-center gap-2 px-1">
        <div className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground">
          <icons.brand className="size-3" />
        </div>
        <span className="text-xs font-semibold">Dossier</span>
      </div>
      {[0, 1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className={cn(
            "h-2.5 rounded bg-muted",
            item === 0 && "bg-primary/20"
          )}
        />
      ))}
    </aside>
  )
}

function DashboardPreview() {
  return (
    <div className="flex h-full min-h-0">
      <SidebarPreview />
      <div className="flex-1 space-y-3 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Dashboard</span>
          <div className="h-4 w-14 rounded bg-primary" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {dashboardStats.slice(0, 3).map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border bg-card p-2"
            >
              <p className="truncate text-[10px] text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-sm font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          {recentDossiers.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-card px-2 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium leading-tight">
                  {d.subject}
                </p>
                <p className="text-[10px] text-muted-foreground">{d.id}</p>
              </div>
              <Badge
                variant={getStatusBadgeVariant(d.status)}
                className="h-5 shrink-0 px-1.5 text-[9px]"
              >
                {d.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MacbookMockup() {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl">
        <div className="flex aspect-[16/10] w-full flex-col">
          <BrowserChrome />
          <div className="min-h-0 flex-1">
            <DashboardPreview />
          </div>
        </div>
      </div>

      <div className="relative mx-auto h-4 w-[106%] -translate-x-[2.83%] rounded-b-xl border border-t-0 border-border bg-gradient-to-b from-muted to-muted-foreground/10">
        <div className="absolute top-0 left-1/2 h-1 w-20 -translate-x-1/2 rounded-b-md bg-foreground/25" />
      </div>
    </div>
  )
}

export function MobileMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-40 sm:w-48", className)}>
      <div className="relative overflow-hidden rounded-[2.25rem] border-4 border-foreground bg-background shadow-2xl">
        <div className="absolute top-2 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-foreground" />
        <div className="aspect-[9/19] space-y-2 bg-card p-3 pt-8">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <div className="flex size-4 items-center justify-center rounded bg-primary text-primary-foreground">
                <icons.brand className="size-2.5" />
              </div>
              <span className="text-[10px] font-semibold">Dossier</span>
            </span>
            <icons.notifications className="size-3.5 text-muted-foreground" />
          </div>

          <div className="rounded-lg border bg-card p-2">
            <p className="text-[8px] text-muted-foreground">
              {dashboardStats[0].label}
            </p>
            <p className="text-sm font-semibold">{dashboardStats[0].value}</p>
          </div>

          <div className="space-y-1.5">
            {recentDossiers.slice(0, 3).map((d) => (
              <div
                key={d.id}
                className="rounded-lg border bg-card p-1.5"
              >
                <p className="truncate text-[9px] font-medium leading-tight">
                  {d.subject}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[8px] text-muted-foreground">
                    {d.id}
                  </span>
                  <Badge
                    variant={getStatusBadgeVariant(d.status)}
                    className="h-3.5 px-1 text-[7px]"
                  >
                    {d.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeviceShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <MacbookMockup />
      <MobileMockup className="absolute -bottom-10 -right-2 sm:-right-6 lg:-right-16" />
    </div>
  )
}
