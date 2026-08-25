import { useState, useRef, useEffect } from "react"
import { flushSync } from "react-dom"
import { icons } from "@/constants"
import { cn } from "@/lib/utils"
import { getStoredMode, applyMode, type ThemeMode } from "@/components/common/theme-toggle"

type AnimatedThemeTogglerProps = {
  className?: string
  duration?: number
}

export function AnimatedThemeToggler({ className, duration = 700 }: AnimatedThemeTogglerProps) {
  const stored = getStoredMode()
  const resolved = stored === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : stored

  const [isDark, setIsDark] = useState(resolved === "dark")
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", isDark)
    root.classList.toggle("light", !isDark)
    root.style.colorScheme = isDark ? "dark" : "light"
  }, [isDark])

  const changeTheme = async () => {
    if (!buttonRef.current) return
    if (!document.startViewTransition) {
      setIsDark((d) => !d)
      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setIsDark((d) => {
          const next = !d
          const mode: ThemeMode = next ? "dark" : "light"
          applyMode(mode)
          return next
        })
      })
    }).ready

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
    const y = top + height / 2
    const x = left + width / 2

    const right = window.innerWidth - left
    const bottom = window.innerHeight - top
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom))

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    )
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={changeTheme}
      className={cn("inline-flex items-center justify-center", className)}
    >
      {isDark ? <icons.sun className="size-4" /> : <icons.moon className="size-4" />}
    </button>
  )
}
