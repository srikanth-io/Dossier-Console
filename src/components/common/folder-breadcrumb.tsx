import { Button } from "@/components/ui/button"
import { icons, type IconName } from "@/constants"
import { cn } from "@/lib/utils"
import type { FolderItem } from "@/lib/folders"

type FolderBreadcrumbProps = {
  items: FolderItem[]
  onNavigate: (itemId: string) => void
  className?: string
}

export function FolderBreadcrumb({ items, onNavigate, className }: FolderBreadcrumbProps) {
  return (
    <nav
      aria-label="Folder breadcrumb"
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground",
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-6 gap-1 px-1.5 text-xs"
        onClick={() => onNavigate("")}
      >
        <icons.dashboard className="size-3" />
        Home
      </Button>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const itemIcon = (item.icon as IconName) ?? "file"
        const IconComponent = icons[itemIcon]

        return (
          <span key={item.id} className="flex items-center gap-1">
            <span className="text-muted-foreground/40">/</span>
            {isLast ? (
              <span className="flex items-center gap-1 font-medium text-foreground">
                {IconComponent && <IconComponent className="size-3" />}
                {item.name}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-xs"
                onClick={() => onNavigate(item.id)}
              >
                {IconComponent && <IconComponent className="size-3" />}
                {item.name}
              </Button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
