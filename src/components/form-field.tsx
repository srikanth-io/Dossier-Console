import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type FormFieldProps = React.ComponentProps<"div"> & {
  label?: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}

function FormField({
  className,
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div
      data-slot="form-field"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs leading-relaxed text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export { FormField }
