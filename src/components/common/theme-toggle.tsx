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
const ACCENT_KEY = "dossier-accent"
const FONT_SCALE_KEY = "dossier-font-scale"
const MOTION_KEY = "dossier-motion"

/* ── Types ── */
export type ThemeMode = "light" | "dark" | "system"
export type ThemePreset = "monochrome" | "dracula" | "catppuccin" | "vercel" | "github"
export type FontScale = "compact" | "default" | "large"

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

/* ── Accent helpers ── */
/* Each accent pairs a pastel fill (--primary-soft) with a darker tone
   of the same hue (--primary) so icons, links and labels stay readable. */
export const accentChoices = [
  { key: "auto", value: null, dark: null },
  { key: "indigo", value: "#c7d2fe", dark: "#4f46e5" },
  { key: "violet", value: "#ddd6fe", dark: "#7c3aed" },
  { key: "sky", value: "#bae6fd", dark: "#0284c7" },
  { key: "emerald", value: "#a7f3d0", dark: "#059669" },
  { key: "amber", value: "#fde68a", dark: "#b45309" },
  { key: "rose", value: "#fecdd3", dark: "#e11d48" },
] as const

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function applyAccent(key: string | null) {
  const root = document.documentElement
  const choice = accentChoices.find((c) => c.key === key)
  if (!choice || choice.value === null || choice.dark === null) {
    root.style.removeProperty("--primary")
    root.style.removeProperty("--primary-foreground")
    root.style.removeProperty("--primary-soft")
    localStorage.removeItem(ACCENT_KEY)
    return
  }
  localStorage.setItem(ACCENT_KEY, choice.key)
  root.style.setProperty("--primary", choice.dark)
  root.style.setProperty("--primary-soft", hexToRgba(choice.value, 0.35))
}

function getStoredAccent(): string | null {
  const stored = localStorage.getItem(ACCENT_KEY)
  if (!stored) return null
  if (accentChoices.some((c) => c.key === stored && c.value)) return stored
  // Migrate pre-pastel hex storage to accent keys.
  const legacy: Record<string, string> = {
    "#6366f1": "indigo",
    "#8b5cf6": "violet",
    "#0ea5e9": "sky",
    "#10b981": "emerald",
    "#f59e0b": "amber",
    "#f43f5e": "rose",
  }
  const migrated = legacy[stored]
  if (migrated) {
    localStorage.setItem(ACCENT_KEY, migrated)
    return migrated
  }
  return null
}

/* ── Font scale helpers ── */
const FONT_SCALES: Record<FontScale, string> = {
  compact: "93.75%",
  default: "100%",
  large: "106.25%",
}

function applyFontScale(scale: FontScale) {
  document.documentElement.style.fontSize = FONT_SCALES[scale]
  localStorage.setItem(FONT_SCALE_KEY, scale)
}

function getStoredFontScale(): FontScale {
  const v = localStorage.getItem(FONT_SCALE_KEY)
  if (v === "compact" || v === "default" || v === "large") return v
  return "default"
}

/* ── Motion helpers ── */
function applyReducedMotion(reduced: boolean) {
  document.documentElement.setAttribute("data-motion", reduced ? "reduced" : "full")
  localStorage.setItem(MOTION_KEY, reduced ? "reduced" : "full")
}

function getStoredReducedMotion(): boolean {
  return localStorage.getItem(MOTION_KEY) === "reduced"
}

/* ── Apply everything persisted ── */
function applyStoredAppearance() {
  applyThemePreset(getStoredThemePreset())
  applyMode(getStoredMode())
  applyAccent(getStoredAccent())
  applyFontScale(getStoredFontScale())
  applyReducedMotion(getStoredReducedMotion())
}

/* ── Circle-spread transition ── */
function circleSpreadTransition(event: React.MouseEvent, callback: () => void) {
  const root = document.documentElement
  const x = event.clientX
  const y = event.clientY
  const maxDim = Math.max(window.innerWidth, window.innerHeight)
  const maxRadius = maxDim * 1.5

  // Capture current theme colors BEFORE switching
  const oldBg = getComputedStyle(root).getPropertyValue("background-color").trim()
  const oldFg = getComputedStyle(root).getPropertyValue("color").trim()

  // Create overlay showing OLD theme, clipped to full circle
  const overlay = document.createElement("div")
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    pointer-events: none;
    background: ${oldBg};
    color: ${oldFg};
    clip-path: circle(${maxRadius}px at ${x}px ${y}px);
    transition: clip-path 550ms cubic-bezier(0.4, 0, 0.2, 1);
  `

  // Copy key computed styles so text/content looks identical
  overlay.style.fontFamily = getComputedStyle(root).fontFamily
  overlay.style.fontSize = getComputedStyle(root).fontSize

  document.body.appendChild(overlay)

  // Apply new theme immediately (visible underneath the overlay)
  callback()

  // Force reflow, then shrink the circle to 0 — revealing new theme
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`
    })
  })

  // Clean up after animation
  setTimeout(() => overlay.remove(), 600)
}

/* ── ThemeToggle component ── */
function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode)
  const systemMediaRef = useRef<MediaQueryList | null>(null)

  // Apply on mount and listen for system changes
  useEffect(() => {
    applyStoredAppearance()

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
      circleSpreadTransition(event, () => {
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

export { ThemeToggle, applyThemePreset, applyMode, getStoredThemePreset, getStoredMode, applyAccent, getStoredAccent, applyFontScale, getStoredFontScale, applyReducedMotion, getStoredReducedMotion, applyStoredAppearance, MODE_KEY, PRESET_KEY }
