import { useCallback, type ReactNode } from "react"

type ClickSparkProps = {
  children: ReactNode
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  className?: string
}

export function ClickSpark({
  children,
  sparkColor = "#ffffff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  className,
}: ClickSparkProps) {
  const createSparks = useCallback(
    (e: React.MouseEvent) => {
      const x = e.clientX
      const y = e.clientY

      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("span")
        const angle = (360 / sparkCount) * i
        const distance = sparkRadius + Math.random() * sparkRadius * 0.5

        spark.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          width: ${sparkSize}px;
          height: ${sparkSize}px;
          border-radius: 50%;
          background: ${sparkColor};
          pointer-events: none;
          transform: translate(-50%, -50%);
          z-index: 99999;
        `

        const rad = (angle * Math.PI) / 180
        const tx = Math.cos(rad) * distance
        const ty = Math.sin(rad) * distance

        spark.animate(
          [
            { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
            { opacity: 0, transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)` },
          ],
          { duration, easing: "ease-out", fill: "forwards" }
        )

        document.body.appendChild(spark)
        setTimeout(() => spark.remove(), duration)
      }
    },
    [sparkColor, sparkSize, sparkRadius, sparkCount, duration]
  )

  return (
    <div
      className={className}
      onMouseDown={createSparks}
    >
      {children}
    </div>
  )
}
