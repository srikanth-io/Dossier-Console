import * as React from "react"
import { cva } from "class-variance-authority"
import { Ban, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { messages } from "@/constants"
import { cn } from "@/lib/utils"

export interface Blocker {
  code: string
  message: string
  overridable: boolean
}

const blockerRowVariants = cva("flex items-start gap-2 text-xs", {
  variants: {
    overridable: {
      true: "text-warning",
      false: "text-destructive",
    },
  },
})

export interface ReviewGateButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "disabled" | "children"> {
  label: string
  blockers: Blocker[]
  onAction?: () => void
  onOverride?: (reason: string) => void
  "data-testid"?: string
}

/**
 * Action gate that always renders why it is disabled (docs/ui-architecture.md §6.4).
 * Every FR-3 / FR-4 gate composes this component — never a bare disabled button.
 */
export function ReviewGateButton({
  label,
  blockers,
  onAction,
  onOverride,
  className,
  variant = "default",
  size = "default",
  ...buttonProps
}: ReviewGateButtonProps) {
  const [overrideOpen, setOverrideOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")

  const blocked = blockers.length > 0
  const allOverridable = blocked && blockers.every((blocker) => blocker.overridable)

  return (
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
      <Button
        {...buttonProps}
        variant={variant}
        size={size}
        disabled={blocked}
        data-testid="review-gate-button"
        aria-disabled={blocked}
        onClick={() => {
          if (!blocked) onAction?.()
        }}
      >
        {label}
      </Button>

      {blocked && (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Ban className="size-3" aria-hidden="true" />
            {messages.findings.gate.blockedBy}{" "}
            {messages.findings.gate.blockerCount(blockers.length)}
          </span>
          <ul className="list-none">
            {blockers.map((blocker) => (
              <li
                key={blocker.code}
                data-testid={`gate-blocker-${blocker.code}`}
                className={cn(blockerRowVariants({ overridable: blocker.overridable }))}
              >
                <ShieldAlert className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                <span>{blocker.message}</span>
              </li>
            ))}
          </ul>

          {allOverridable && onOverride && (
            <Popover open={overrideOpen} onOpenChange={setOverrideOpen}>
              <PopoverTrigger asChild>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  {messages.findings.gate.overrideLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 space-y-2">
                <label className="text-xs font-medium" htmlFor="gate-override-reason">
                  {messages.findings.gate.reasonLabel}
                </label>
                <Textarea
                  id="gate-override-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={messages.findings.gate.reasonPlaceholder}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOverrideOpen(false)}
                  >
                    {messages.findings.gate.cancelOverride}
                  </Button>
                  <Button
                    size="sm"
                    disabled={reason.trim() === ""}
                    onClick={() => {
                      onOverride(reason.trim())
                      setReason("")
                      setOverrideOpen(false)
                    }}
                  >
                    {messages.findings.gate.confirmOverride}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  )
}
