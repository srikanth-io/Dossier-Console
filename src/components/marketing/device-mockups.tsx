import { icons } from "@/constants"
import { dashboardStats, recentDossiers } from "@/data/dashboard"
import { cn } from "@/lib/utils"

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute -inset-12 bg-white/[0.02] blur-[120px] rounded-full" />

      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0d0d0d] shadow-[0_40px_160px_-20px_rgba(0,0,0,0.9)]">

        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-3.5">
          <span className="flex gap-2">
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
          </span>
          <div className="mx-auto flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-1.5 text-[11px] text-white/25">
            <span className="size-3 rounded-full border border-white/10" />
            app.dossier.com
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-6">
          {dashboardStats.slice(0, 3).map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all",
                i === 1 && "border-white/[0.12] bg-white/[0.04]"
              )}
            >
              <p className="text-[11px] text-white/30">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-white/90">{stat.value}</p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-white/20"
                  style={{ width: `${60 + i * 15}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 px-6 pb-6">
          {recentDossiers.slice(0, 3).map((d, i) => (
            <div
              key={d.id}
              className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-all",
                i === 0 && "border-white/[0.12] bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  i === 0 ? "bg-white/10" : "bg-white/[0.04]"
                )}>
                  <icons.dossiers className="size-4 text-white/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{d.subject}</p>
                  <p className="text-[11px] text-white/30">{d.id}</p>
                </div>
              </div>
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] text-white/40">
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
