import { useRef, useState } from "react"
import { motion, useMotionValue, animate } from "motion/react"
import { cn } from "@/lib/utils"

type RadiusScrubberProps = {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function RadiusScrubber({
  value,
  onValueChange,
  min = 0.25,
  max = 1.5,
  className,
}: RadiusScrubberProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startValue = useRef(0)
  const [dragging, setDragging] = useState(false)
  const overflow = useMotionValue(0)
  const scale = useMotionValue(1)

  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0

  function handlePointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    startValue.current = value
    setDragging(true)
    animate(scale, 1.02, { type: "spring", stiffness: 400, damping: 20 })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    const dx = e.clientX - startX.current
    const sensitivity = 0.005
    const newValue = Math.max(min, Math.min(max, startValue.current + dx * sensitivity))
    onValueChange(newValue)

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const overX = Math.max(0, Math.max(rect.left - e.clientX, e.clientX - rect.right))
      overflow.jump(overX * 0.3)
    }
  }

  function handlePointerUp() {
    setDragging(false)
    animate(scale, 1, { type: "spring", stiffness: 300, damping: 15, bounce: 0.3 })
    animate(overflow, 0, { type: "spring", stiffness: 300, damping: 15 })
  }

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      style={{ touchAction: "none", userSelect: "none" }}
    >
      <motion.div
        ref={cardRef}
        className="relative flex h-28 cursor-grab items-center justify-center border-2 border-dashed border-muted-foreground/25 bg-muted/30 active:cursor-grabbing"
        style={{
          borderRadius: `${value}rem`,
          scale,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
      >
        <span className="pointer-events-none text-sm font-medium text-muted-foreground">
          Drag to adjust
        </span>

        {/* Corner indicators */}
        {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
          <div
            key={corner}
            className={cn(
              "absolute size-2 rounded-full bg-primary/50",
              corner === "top-left" && "top-2 left-2",
              corner === "top-right" && "top-2 right-2",
              corner === "bottom-left" && "bottom-2 left-2",
              corner === "bottom-right" && "bottom-2 right-2"
            )}
          />
        ))}
      </motion.div>

      {/* Value bar */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/60">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </div>
        <span className="w-14 text-right text-sm font-medium tabular-nums text-muted-foreground">
          {value.toFixed(2)}rem
        </span>
      </div>
    </div>
  )
}
