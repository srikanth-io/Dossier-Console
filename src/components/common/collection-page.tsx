import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Shared page scaffold for collection screens (Dossiers, Projects, Notepad,
 * Pages, Templates). Compose as:
 *
 *   <CollectionPage>
 *     <PageHeader ... />
 *     <SearchFilterBar ... />
 *     <CollectionSection title="..." description="...">
 *       <Table|CollectionGrid|EmptyState />
 *     </CollectionSection>
 *   </CollectionPage>
 */

export function CollectionPage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-6", className)}>{children}</div>
  )
}

/** Responsive grid for item cards; consistent columns and gap app-wide. */
export function CollectionGrid({
  children,
  className,
  cols = "sm:grid-cols-2 xl:grid-cols-3",
}: {
  children: ReactNode
  className?: string
  cols?: string
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", cols, className)}>{children}</div>
  )
}

/** Card shell for tabular/list content inside a collection page. */
export function CollectionPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * The Documents-screen content shell: one Card with a title + record-count
 * description header; the collection (table/grid) or the empty state renders
 * inside. Every list screen wraps its results in this section.
 */
export function CollectionSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("animate-fade-rise", className)} style={{ animationDelay: "60ms" }}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
