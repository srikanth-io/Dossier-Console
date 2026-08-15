import { useEffect, useState } from "react"

import { icons, messages } from "@/constants"
import { docxToHtml } from "@/services/docxPreview"

type DocxPreviewState =
  | { kind: "loading" }
  | { kind: "ready"; html: string }
  | { kind: "error" }

export function DocxPreview({ fileUrl }: { fileUrl: string }) {
  const [state, setState] = useState<DocxPreviewState>({ kind: "loading" })

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
  }, [fileUrl])

  if (state.kind === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <icons.spinner className="size-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {messages.dossiers.docxPreviewLoading}
        </p>
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
      </div>
    )
  }

  return (
    <div
      className="max-h-[72svh] overflow-y-auto rounded-xl bg-white p-6 text-black [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_table]:w-full"
      dangerouslySetInnerHTML={{ __html: state.html }}
    />
  )
}
