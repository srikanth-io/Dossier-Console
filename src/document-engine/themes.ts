import type { DocTheme } from "@/document-engine/types"

export const FONT_OPTIONS = [
  { value: "Geist Variable", label: "Geist Sans" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "ui-monospace, monospace", label: "Monospace" },
] as const

export const DEFAULT_THEME: DocTheme = {
  headingFont: "Geist Variable",
  bodyFont: "Geist Variable",
  codeFont: "ui-monospace, monospace",
  primary: "#495464",
  secondary: "#bbbfca",
  accent: "#3b82f6",
  background: "#ffffff",
  text: "#1f2937",
  border: "#d1d5db",
  pageMargin: 56,
  sectionSpacing: 24,
  paragraphSpacing: 12,
  componentSpacing: 16,
  companyName: "Dossier",
  footerText: "Confidential",
}

export interface ThemePreset {
  id: string
  name: string
  theme: DocTheme
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "corporate",
    name: "Corporate",
    theme: {
      ...DEFAULT_THEME,
      primary: "#1e3a5f",
      accent: "#2563eb",
      text: "#1f2937",
      border: "#cbd5e1",
    },
  },
  {
    id: "modern",
    name: "Modern",
    theme: {
      ...DEFAULT_THEME,
      primary: "#0f172a",
      accent: "#8b5cf6",
      text: "#111827",
      border: "#e2e8f0",
    },
  },
  {
    id: "security",
    name: "Security",
    theme: {
      ...DEFAULT_THEME,
      primary: "#111827",
      accent: "#dc2626",
      text: "#1f2937",
      border: "#334155",
      footerText: "Confidential — Internal Use Only",
    },
  },
  {
    id: "education",
    name: "Education",
    theme: {
      ...DEFAULT_THEME,
      primary: "#1e40af",
      accent: "#0ea5e9",
      text: "#1e293b",
      border: "#93c5fd",
    },
  },
  {
    id: "business",
    name: "Business",
    theme: {
      ...DEFAULT_THEME,
      primary: "#065f46",
      accent: "#059669",
      text: "#111827",
      border: "#a7f3d0",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    theme: {
      ...DEFAULT_THEME,
      primary: "#111827",
      accent: "#111827",
      text: "#111827",
      border: "#e5e7eb",
    },
  },
]

export function themePresetById(id: string): DocTheme | undefined {
  return THEME_PRESETS.find((p) => p.id === id)?.theme
}
