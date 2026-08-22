import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { icons } from "@/constants"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const hours12 = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
const minutes = ["00", "15", "30", "45"]

function to12h(value: string): { h: string; m: string; period: "AM" | "PM" } {
  if (!value) return { h: "9", m: "00", period: "AM" }
  const [hh, mm] = value.split(":")
  const hour = parseInt(hh, 10)
  const period: "AM" | "PM" = hour >= 12 ? "PM" : "AM"
  const h12 = hour === 0 ? "12" : hour > 12 ? String(hour - 12) : String(hour)
  return { h: h12, m: mm || "00", period }
}

function to24h(h: string, m: string, period: "AM" | "PM"): string {
  let hour = parseInt(h, 10)
  if (period === "AM" && hour === 12) hour = 0
  if (period === "PM" && hour !== 12) hour += 12
  return `${String(hour).padStart(2, "0")}:${m}`
}

function formatDisplay(value: string): string {
  if (!value) return ""
  const { h, m, period } = to12h(value)
  return `${h}:${m} ${period}`
}

type TimePickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const { h, m, period } = to12h(value)

  const select = (hour: string, min: string, per: "AM" | "PM") => {
    onChange(to24h(hour, min, per))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <icons.pendingReviews className="mr-2 size-4 shrink-0" />
          {value ? formatDisplay(value) : "Pick a time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="flex gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Hour</p>
            <div className="grid grid-cols-4 gap-1">
              {hours12.map((hour) => (
                <Button
                  key={hour}
                  variant={hour === h ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-10 text-xs tabular-nums"
                  onClick={() => select(hour, m, period)}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Min</p>
            <div className="grid grid-cols-2 gap-1">
              {minutes.map((min) => (
                <Button
                  key={min}
                  variant={min === m ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-10 text-xs tabular-nums"
                  onClick={() => select(h, min, period)}
                >
                  {min}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Period</p>
            <div className="grid grid-cols-1 gap-1">
              {(["AM", "PM"] as const).map((per) => (
                <Button
                  key={per}
                  variant={per === period ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-12 text-xs font-semibold"
                  onClick={() => select(h, m, per)}
                >
                  {per}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { TimePicker }
