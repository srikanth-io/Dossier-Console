import { useCallback, useEffect, useRef, useState } from "react"

import { icons } from "@/constants"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/* ── Storage keys ── */
const MODE_KEY = "dossier-theme-mode"
const PRESET_KEY = "dossier-theme-preset"

/* ── Types ── */
export type ThemeMode = "light" | "dark" | "system"
export type ThemePreset = "monochrome" | "dracula" | "catppuccin" | "vercel" | "github"

/* ── Preset helpers ── */
function applyThemePreset(preset: ThemePreset) {
  document.documentElement.setAttribute("data-theme", preset)
  localStorage.setItem(PRESET_KEY, preset)
}

function getStoredThemePreset(): ThemePreset {
  const v = localStorage.getItem(PRESET_KEY)
  if (v === "monochrome" || v === "dracula" || v === "catppuccin" || v === "vercel" || v === "github") return v
  return "monochrome"
}

/* ── Mode helpers ── */
function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  return mode
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement
  const resolved = resolveMode(mode)
  root.classList.toggle("dark", resolved === "dark")
  root.classList.toggle("light", resolved === "light")
  root.style.colorScheme = resolved
  localStorage.setItem(MODE_KEY, mode)
}

function getStoredMode(): ThemeMode {
  const v = localStorage.getItem(MODE_KEY)
  if (v === "light" || v === "dark" || v === "system") return v
  return "dark"
}

/* ── Circle-spread animation ── */
function circleSpreadAnimation(event: React.MouseEvent, callback: () => void) {
  const root = document.documentElement
  const x = event.clientX
  const y = event.clientY
  const maxDim = Math.max(window.innerWidth, window.innerHeight)
  const radius = maxDim * 2.5

  // Create the overlay circle
  const overlay = document.createElement("div")
  overlay.style.cssText = `
    position: fixed;
    top: ${y}px;
    left: ${x}px;
    width: 0;
    height: 0;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 99999;
    background: ${root.classList.contains("dark") ? "#ffffff" : "#09090b"};
    transition: width 550ms cubic-bezier(0.4, 0, 0.2, 1), height 550ms cubic-bezier(0.4, 0, 0.2, 1);
  `
  document.body.appendChild(overlay)

  // Force reflow, then expand
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.width = `${radius}px`
      overlay.style.height = `${radius}px`
    })
  })

  // Apply the mode change halfway through the animation
  setTimeout(() => {
    callback()
  }, 220)

  // Remove overlay after animation
  setTimeout(() => {
    overlay.style.opacity = "0"
    overlay.style.transition = "opacity 300ms ease-out"
    setTimeout(() => overlay.remove(), 300)
  }, 550)
}

/* ── ThemeToggle component ── */
function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode)
  const systemMediaRef = useRef<MediaQueryList | null>(null)

  // Apply on mount and listen for system changes
  useEffect(() => {
    applyThemePreset(getStoredThemePreset())
    applyMode(mode)

    if (mode === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      systemMediaRef.current = media
      const handler = () => applyMode("system")
      media.addEventListener("change", handler)
      return () => media.removeEventListener("change", handler)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeChange = useCallback(
    (newMode: ThemeMode, event: React.MouseEvent) => {
      circleSpreadAnimation(event, () => {
        setMode(newMode)
        applyMode(newMode)
      })
    },
    []
  )

  const modeIcons: Record<ThemeMode, React.ReactNode> = {
    light: <icons.sun className="size-4" />,
    dark: <icons.moon className="size-4" />,
    system: <icons.monitor className="size-4" />,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className={className}>
          {modeIcons[mode]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem onClick={(e) => handleModeChange("light", e)}>
          <icons.sun className="size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleModeChange("dark", e)}>
          <icons.moon className="size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleModeChange("system", e)}>
          <icons.monitor className="size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeToggle, applyThemePreset, applyMode, getStoredThemePreset, getStoredMode, MODE_KEY, PRESET_KEY }
