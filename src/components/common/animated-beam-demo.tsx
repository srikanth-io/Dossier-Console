import { cn } from "@/lib/utils"
import { icons } from "@/constants"

const outputs = [
  { label: "Dashboard", icon: icons.dashboard },
  { label: "Templates", icon: icons.fileCode },
  { label: "Documents", icon: icons.openFile },
  { label: "Projects", icon: icons.dossiers },
]

function AnimatedBeamDemo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-6", className)}>
      {/* Source node */}
      <div className="flex size-12 items-center justify-center rounded-xl border border-border/50 bg-primary/10 text-primary shadow-sm">
        <icons.sparkles className="size-5" />
      </div>

      {/* Beams */}
      <div className="relative flex flex-col gap-3">
        {outputs.map((out, i) => {
          const Icon = out.icon
          return (
            <div key={out.label} className="flex items-center gap-3">
              {/* Animated line */}
              <div className="relative h-px w-12 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-primary/60 to-primary animate-beam"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              </div>
              {/* Output node */}
              <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-1.5 shadow-sm">
                <Icon className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{out.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { AnimatedBeamDemo }
