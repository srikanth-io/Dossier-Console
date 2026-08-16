import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 text-xs font-medium whitespace-nowrap transition-all duration-150 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground [a]:hover:bg-muted/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive [a]:hover:bg-destructive/15 dark:bg-destructive/20",
        outline: "border-border bg-transparent text-foreground [a]:hover:bg-muted",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        success:
          "bg-success/10 text-success dark:bg-success/15 dark:text-success",
        warning:
          "bg-warning/10 text-warning dark:bg-warning/15 dark:text-warning",
        info: "bg-info/10 text-info dark:bg-info/15 dark:text-info",
        brand: "bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
