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
        "fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-500",
        leaving && "pointer-events-none opacity-0"
      )}
      aria-hidden={leaving}
    >
      <div className="animate-splash-scale-in flex size-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
        <icons.brand className="size-8" />
      </div>

      <div className="animate-splash-fade-in text-center">
        <p className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {messages.nav.brand}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {messages.nav.console}
        </p>
      </div>

      <div className="animate-splash-fade-in h-1 w-44 overflow-hidden rounded-full bg-muted">
        <div className="animate-splash-bar h-full rounded-full bg-gradient-brand" />
      </div>
    </div>
  )
}
