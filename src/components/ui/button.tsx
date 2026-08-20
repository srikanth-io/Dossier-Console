import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { LoaderCircleIcon } from "@/components/icons/loader-circle"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:bg-primary/90",
        outline:
          "border border-border bg-card text-foreground shadow-xs hover:border-foreground/25 hover:bg-muted/60 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[0.8125rem]",
        lg: "h-11 gap-2 rounded-lg px-6 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-7 rounded-md",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading || undefined}
      {...props}
    >
      {loading && (
        <LoaderCircleIcon
          data-slot="button-loader"
          className="size-4 animate-spin"
        />
      )}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
