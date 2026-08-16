import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { icons, messages, commonMessages } from "@/constants"
import { docxToHtml } from "@/services/docxPreview"
import { cn } from "@/lib/utils"

type DocxPreviewState =
  | { kind: "loading" }
  | { kind: "ready"; html: string }
  | { kind: "error" }

export function DocxPreview({ fileUrl }: { fileUrl: string }) {
  const [state, setState] = useState<DocxPreviewState>({ kind: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setState({ kind: "loading" })
    docxToHtml(fileUrl).then((html) => {
      if (!active) return
      setState(html === null ? { kind: "error" } : { kind: "ready", html })
    })
    return () => {
      active = false
    }
  }, [fileUrl, attempt])

  if (state.kind === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <icons.spinner className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {messages.dossiers.docxPreviewLoading}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn("h-2.5 rounded-full bg-muted", i % 3 === 2 ? "w-2/3" : "w-full")}
            />
          ))}
        </div>
      </div>
    )
  }

  if (state.kind === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <icons.alertCircle className="size-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {messages.dossiers.docxPreviewFailed}
        </p>
        <Button variant="outline" size="sm" onClick={() => setAttempt((a) => a + 1)}>
          <icons.retry className="size-3.5" />
          {commonMessages.retry}
        </Button>
      </div>
    )
  }

  return (
    <div
      className="max-h-[72svh] overflow-y-auto rounded-xl bg-white p-6 text-black ring-1 ring-border/60 [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_table]:w-full"
      dangerouslySetInnerHTML={{ __html: state.html }}
    />
  )
}
