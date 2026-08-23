import { icons } from "@/constants"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchFilterBarProps {
  query: string
  onQueryChange: (value: string) => void
  placeholder: string
  children?: React.ReactNode
  className?: string
}

/**
 * Single-line toolbar: search input pinned to the left, filter controls
 * (dropdowns / view toggles) pushed to the far right. Full-width children
 * wrap onto their own row below.
 */
export function SearchFilterBar({
  query,
  onQueryChange,
  placeholder,
  children,
  className,
}: SearchFilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 animate-fade-rise", className)}>
      <div className="relative w-full sm:w-64 shrink-0">
        <icons.search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-8"
        />
      </div>
      {children && (
        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          {children}
        </div>
      )}
    </div>
  )
}
