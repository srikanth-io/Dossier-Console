import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { icons } from "@/constants"

const notifications = [
  { title: "New dossier created", description: "\"Q4 Marketing Plan\" was added to your workspace", icon: icons.plus, color: "text-emerald-500" },
  { title: "Document published", description: "\"API Documentation v2\" is now live", icon: icons.check, color: "text-blue-500" },
  { title: "Comment added", description: "Srikanth commented on \"Brand Guidelines\"", icon: icons.messageCircle, color: "text-violet-500" },
  { title: "File uploaded", description: "3 new assets added to \"Design Files\"", icon: icons.openFile, color: "text-amber-500" },
  { title: "Reminder", description: "\"Project Review\" deadline is tomorrow", icon: icons.notifications, color: "text-rose-500" },
]

function AnimatedListDemo({ className }: { className?: string }) {
  const [items, setItems] = useState<typeof notifications>([])

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [notifications[idx % notifications.length], ...prev].slice(0, 5)
        return next
      })
      idx++
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("flex flex-col gap-2 overflow-hidden", className)}>
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <div
            key={`${item.title}-${i}`}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/80 p-3 shadow-sm animate-fade-rise"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-muted", item.color)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { AnimatedListDemo }
