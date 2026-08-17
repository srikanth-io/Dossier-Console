import { useEffect, useState } from "react"

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

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggle = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
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
          <span className="relative flex size-4 items-center justify-center">
            {theme === "dark" ? (
              <icons.sun className="size-4 animate-[theme-icon-spin_0.3s_ease]" />
            ) : (
              <icons.moon className="size-4 animate-[theme-icon-spin_0.3s_ease]" />
            )}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {theme === "dark" ? messages.layout.themeLight : messages.layout.themeDark}
      </TooltipContent>
    </Tooltip>
  )
}

export { ThemeToggle }
