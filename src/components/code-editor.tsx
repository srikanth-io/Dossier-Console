import { useEffect, useRef, type RefObject } from "react"
import type { Extension } from "@codemirror/state"
import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { basicSetup } from "codemirror"

import { cn } from "@/lib/utils"

export type CodeEditorApi = {
  focusLine: (line: number) => void
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  extensions?: Extension[]
  className?: string
  apiRef?: RefObject<CodeEditorApi | null>
}

const codeEditorTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "13px" },
  ".cm-scroller": {
    fontFamily: "Geist Mono, ui-monospace, monospace",
    lineHeight: "1.6",
  },
  "&.cm-focused": { outline: "none" },
})

export function CodeEditor({
  value,
  onChange,
  extensions = [],
  className,
  apiRef,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          codeEditorTheme,
          EditorState.tabSize.of(2),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
          ...extensions,
        ],
      }),
    })

    viewRef.current = view
    if (apiRef) {
      apiRef.current = {
        focusLine: (line: number) => {
          const doc = view.state.doc
          const target = Math.max(1, Math.min(line, doc.lines))
          const pos = doc.line(target).from
          view.dispatch({
            selection: { anchor: pos },
            scrollIntoView: true,
          })
          view.focus()
          requestAnimationFrame(() => {
            const scroller = view.scrollDOM
            const coords = view.coordsAtPos(pos)
            if (!scroller || !coords) return
            const rect = scroller.getBoundingClientRect()
            const coordsHeight = coords.bottom - coords.top
            if (coords.top < rect.top || coords.bottom > rect.bottom) {
              const delta = coords.top - rect.top - (rect.height - coordsHeight) / 2
              scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: "smooth" })
            }
          })
        },
      }
    }
    return () => {
      view.destroy()
      viewRef.current = null
      if (apiRef) apiRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (value !== current) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full overflow-hidden", className)}
    />
  )
}
