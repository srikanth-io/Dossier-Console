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
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const maxDim = Math.max(window.innerWidth, window.innerHeight) * 2.5

    const overlay = document.createElement("div")
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;pointer-events:none;
      display:flex;align-items:center;justify-content:center;
    `
    const circle = document.createElement("div")
    const targetBg = theme === "dark" ? "hsl(40 20% 98%)" : "hsl(230 15% 12%)"
    circle.style.cssText = `
      width:0;height:0;border-radius:50%;
      background:${targetBg};
      transform:translate(${x - window.innerWidth / 2}px, ${y - window.innerHeight / 2}px);
      transition:width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1);
    `
    overlay.appendChild(circle)
    document.body.appendChild(overlay)

    requestAnimationFrame(() => {
      circle.style.width = `${maxDim}px`
      circle.style.height = `${maxDim}px`
      circle.style.transform = "translate(0px, 0px)"
    })

    setTimeout(() => {
      setTheme((t) => (t === "dark" ? "light" : "dark"))
    }, 250)

    setTimeout(() => {
      circle.style.opacity = "0"
      circle.style.transition = "opacity 0.3s ease-out"
    }, 500)

    setTimeout(() => {
      overlay.remove()
      setAnimating(false)
    }, 800)
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
