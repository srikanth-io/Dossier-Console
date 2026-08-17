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
    const btn = buttonRef.current
    if (!btn) {
      setTheme((t) => (t === "dark" ? "light" : "dark"))
      return
    }

    setAnimating(true)

    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const radius = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    )
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("width", "100%")
    svg.setAttribute("height", "100%")
    svg.style.cssText =
      "position:fixed;inset:0;z-index:9999;pointer-events:none;"

    const defs = document.createElementNS(svgNS, "defs")
    const clipPath = document.createElementNS(svgNS, "clipPath")
    clipPath.id = "theme-clip"
    const circle = document.createElementNS(svgNS, "circle")
    circle.setAttribute("cx", String(cx))
    circle.setAttribute("cy", String(cy))
    circle.setAttribute("r", "0")
    clipPath.appendChild(circle)
    defs.appendChild(clipPath)
    svg.appendChild(defs)

    const rect2 = document.createElementNS(svgNS, "rect")
    rect2.setAttribute("x", "0")
    rect2.setAttribute("y", "0")
    rect2.setAttribute("width", "100%")
    rect2.setAttribute("height", "100%")
    rect2.setAttribute("clip-path", "url(#theme-clip)")

    const goingDark = theme === "light"
    rect2.setAttribute(
      "fill",
      goingDark ? "rgb(15,18,28)" : "rgb(255,255,255)"
    )

    svg.appendChild(rect2)
    document.body.appendChild(svg)

    const duration = 420
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      circle.setAttribute("r", String(eased * radius))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setTheme((t) => (t === "dark" ? "light" : "dark"))

        svg.style.transition = "opacity 0.35s ease-out"
        svg.style.opacity = "0"

        setTimeout(() => {
          svg.remove()
          setAnimating(false)
        }, 380)
      }
    }

    requestAnimationFrame(animate)
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
