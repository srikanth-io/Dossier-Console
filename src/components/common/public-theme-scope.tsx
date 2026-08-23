import { useEffect, type ReactNode } from "react"

import { applyMode, getStoredMode } from "@/components/common/theme-toggle"

/**
 * Public surfaces (landing, auth, password reset) are always rendered in
 * light mode. The wrapper strips the `dark` class while mounted and
 * restores the account's saved colour mode when the user re-enters the app.
 */
export function PublicThemeScope({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark")
    root.classList.add("light")
    root.style.colorScheme = "light"

    return () => {
      applyMode(getStoredMode())
    }
  }, [])

  return <>{children}</>
}
