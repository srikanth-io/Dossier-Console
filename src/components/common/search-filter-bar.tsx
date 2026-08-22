import { icons } from "@/constants"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchFilterBarProps {
  query: string
  onQueryChange: (value: string) => void
  placeholder: string
  count?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function SearchFilterBar({
  query,
  onQueryChange,
  placeholder,
  count,
  children,
  className,
}: SearchFilterBarProps) {
  return (
    <div className={cn("space-y-3 animate-fade-rise", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <icons.search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        {count && (
          <p className="text-sm text-muted-foreground">{count}</p>
        )}
      </div>
      {children}
    </div>
  )
}
