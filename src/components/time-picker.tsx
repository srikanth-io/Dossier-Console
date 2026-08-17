import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { icons } from "@/constants"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const minutes = ["00", "15", "30", "45"]

type TimePickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [h, m] = value ? value.split(":") : ["09", "00"]

  const select = (hour: string, min: string) => {
    onChange(`${hour}:${min}`)
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
          {value || "Pick a time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="flex gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Hour</p>
            <div className="grid grid-cols-4 gap-1">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  variant={hour === h ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-10 text-xs tabular-nums"
                  onClick={() => select(hour, m)}
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
                  onClick={() => select(h, min)}
                >
                  {min}
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
