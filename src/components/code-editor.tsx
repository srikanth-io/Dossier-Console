import { useEffect, useRef, type RefObject } from "react"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags } from "@lezer/highlight"
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

const studioHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.comment, color: "var(--muted-foreground)", fontStyle: "italic" },
    { tag: [tags.string, tags.special(tags.string)], color: "var(--success)" },
    { tag: [tags.number, tags.bool], color: "var(--warning)" },
    { tag: [tags.keyword, tags.operatorKeyword], color: "var(--primary)", fontWeight: "600" },
    { tag: [tags.typeName, tags.className, tags.namespace], color: "var(--info)" },
    { tag: tags.function(tags.variableName), color: "var(--primary)" },
    { tag: [tags.propertyName, tags.attributeName], color: "var(--primary)" },
    { tag: tags.variableName, color: "var(--foreground)" },
    { tag: tags.tagName, color: "var(--primary)" },
    { tag: [tags.operator, tags.punctuation, tags.bracket], color: "var(--muted-foreground)" },
  ])
)

const codeEditorTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "13px", backgroundColor: "transparent", color: "var(--foreground)" },
  ".cm-scroller": {
    fontFamily: "Geist Mono, ui-monospace, monospace",
    lineHeight: "1.6",
  },
  ".cm-content": { padding: "8px 0" },
  "&.cm-focused": { outline: "none" },
  ".cm-cursor": { borderLeftColor: "var(--primary)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "color-mix(in srgb, var(--primary) 18%, transparent)",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    borderRight: "1px solid var(--border)",
  },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--primary) 5%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
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
          studioHighlight,
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
