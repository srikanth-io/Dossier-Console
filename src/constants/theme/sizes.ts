export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
} as const

export const componentHeights = {
  xs: "2rem",
  sm: "2rem",
  md: "2.25rem",
  lg: "2.5rem",
  xl: "2.75rem",
} as const

export const layoutSizes = {
  sidebarWidth: "16rem",
  sidebarCollapsedWidth: "4.5rem",
  headerHeight: "3.5rem",
  contentPadding: "1.5rem",
  contentMaxWidth: "87.5rem",
} as const

export const iconSizes = {
  sm: "1rem",
  md: "1.25rem",
  lg: "1.5rem",
} as const

export const radii = {
  base: "0.75rem",
  sm: "calc(var(--radius) * 0.667)",
  md: "calc(var(--radius) * 0.833)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) * 1.333)",
  "2xl": "calc(var(--radius) * 1.667)",
  "3xl": "calc(var(--radius) * 2)",
  "4xl": "calc(var(--radius) * 2.667)",
} as const

export const shadows = {
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  glow: "var(--shadow-glow)",
} as const

export const motion = {
  duration: {
    micro: "150ms",
    standard: "200ms",
    dialog: "250ms",
    complex: "400ms",
  },
  easing: {
    enter: "cubic-bezier(0.22, 1, 0.36, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const
