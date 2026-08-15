import { useEffect, useState } from "react"

import { SPLASH, icons, messages } from "@/constants"
import { cn } from "@/lib/utils"

type SplashScreenProps = {
  onFinished: () => void
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(
      () => setLeaving(true),
      SPLASH.displayMs - SPLASH.fadeMs
    )
    const doneTimer = setTimeout(onFinished, SPLASH.displayMs)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onFinished])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-500",
        leaving && "pointer-events-none opacity-0"
      )}
      aria-hidden={leaving}
    >
      <div className="animate-splash-scale-in flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <icons.brand className="size-8" />
      </div>

      <div className="animate-splash-fade-in text-center">
        <p className="text-2xl font-semibold tracking-tight">
          {messages.nav.brand}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {messages.nav.console}
        </p>
      </div>

      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="animate-splash-bar h-full rounded-full bg-primary" />
      </div>
    </div>
  )
}
