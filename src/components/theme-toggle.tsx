import { useEffect, useRef, useState } from "react"

import { icons, messages } from "@/constants"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const THEME_KEY = "dossier-theme"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [animating, setAnimating] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggle = () => {
    if (animating) return
    setAnimating(true)

    const btn = buttonRef.current
    if (!btn) {
      setTheme((t) => (t === "dark" ? "light" : "dark"))
      setAnimating(false)
      return
    }

    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const maxDim = Math.hypot(window.innerWidth, window.innerHeight) * 2

    const overlay = document.createElement("div")
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;"

    const circle = document.createElement("div")
    const goingDark = theme === "light"
    const circleColor = goingDark
      ? "rgba(15, 18, 28, 0.55)"
      : "rgba(255, 255, 255, 0.55)"

    Object.assign(circle.style, {
      position: "absolute",
      left: `${cx}px`,
      top: `${cy}px`,
      width: "0px",
      height: "0px",
      borderRadius: "50%",
      background: circleColor,
      transform: "translate(-50%, -50%)",
      willChange: "width, height",
      transition:
        "width 0.6s cubic-bezier(0.4,0,0.2,1), height 0.6s cubic-bezier(0.4,0,0.2,1)",
    })

    overlay.appendChild(circle)
    document.body.appendChild(overlay)

    requestAnimationFrame(() => {
      circle.style.width = `${maxDim}px`
      circle.style.height = `${maxDim}px`
    })

    setTimeout(() => {
      setTheme((t) => (t === "dark" ? "light" : "dark"))
    }, 180)

    setTimeout(() => {
      Object.assign(circle.style, {
        opacity: "0",
        transition: "opacity 0.4s ease-out",
      })
    }, 450)

    setTimeout(() => {
      overlay.remove()
      setAnimating(false)
    }, 900)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon-sm"
          className={className}
          aria-label={
            theme === "dark"
              ? messages.layout.themeToggleLight
              : messages.layout.themeToggleDark
          }
          onClick={toggle}
        >
          {theme === "dark" ? <icons.sun /> : <icons.moon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {theme === "dark" ? messages.layout.themeLight : messages.layout.themeDark}
      </TooltipContent>
    </Tooltip>
  )
}

export { ThemeToggle }
