import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { commonMessages, icons } from "@/constants"
import { cn } from "@/lib/utils"

type DateFieldProps = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  /** Extra classes for the trigger button; width defaults to full. */
  className?: string
  disabled?: boolean
  ariaLabel?: string
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Converts a `yyyy-mm-dd` key to a local Date, or undefined when blank. */
export function dateKeyToDate(key: string | null | undefined): Date | undefined {
  if (!key) return undefined
  const [year, month, day] = key.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export function dateToDateKey(date: Date): string {
  return formatDateKey(date)
}

export function DateField({
  value,
  onChange,
  className,
  disabled,
  ariaLabel,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-between text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <icons.calendar className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {value ? formatDateLong(value) : commonMessages.selectDate}
            </span>
          </span>
          <icons.chevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-auto p-0">
        <Calendar
          mode="single"
          fixedWeeks
          selected={value}
          onSelect={(day) => {
            onChange(day)
            if (day) setOpen(false)
          }}
        />
        <div className="border-t border-border/60 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => {
              onChange(new Date())
              setOpen(false)
            }}
          >
            <icons.calendar className="size-4" />
            {commonMessages.jumpToToday}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
