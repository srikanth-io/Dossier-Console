import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react"

import {
  createBlock,
  detectMarkdownShortcut,
  getBlockPlaceholder,
  type Block,
  type BlockType,
} from "@/lib/blocks"
import { cn } from "@/lib/utils"
import { SlashCommandMenu } from "@/components/slash-command-menu"
import { RichTextToolbar } from "@/components/rich-text-toolbar"
import { icons } from "@/constants"

type BlockEditorProps = {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  className?: string
}

function caretIsAtStart(el: HTMLElement): boolean {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return false
  const range = sel.getRangeAt(0)
  if (!range.collapsed) return false

  const preRange = document.createRange()
  preRange.selectNodeContents(el)
  preRange.setEnd(range.startContainer, range.startOffset)
  return preRange.toString().length === 0
}

function caretIsAtEnd(el: HTMLElement): boolean {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return false
  const range = sel.getRangeAt(0)
  if (!range.collapsed) return false

  const postRange = document.createRange()
  postRange.selectNodeContents(el)
  postRange.setStart(range.endContainer, range.endOffset)
  return postRange.toString().length === 0
}

function moveCaretToEnd(el: HTMLElement) {
  el.focus()
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

function moveCaretToStart(el: HTMLElement) {
  el.focus()
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

function getTextContent(el: HTMLElement): string {
  return el.textContent ?? ""
}

function BlockEditor({ blocks, onChange, className }: BlockEditorProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashBlockId, setSlashBlockId] = useState<string | null>(null)
  const [slashQuery, setSlashQuery] = useState("")
  const [slashPos, setSlashPos] = useState<{ x: number; y: number } | null>(null)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const getBlockRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) blockRefs.current.set(id, el)
      else blockRefs.current.delete(id)
    },
    []
  )

  const updateBlock = useCallback(
    (id: string, updates: Partial<Block>) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
    },
    [blocks, onChange]
  )

  const insertBlockAfter = useCallback(
    (afterId: string, type: BlockType = "paragraph", text = "") => {
      const newBlock = createBlock(
        type,
        text ? [{ text, styles: [] }] : undefined
      )
      const idx = blocks.findIndex((b) => b.id === afterId)
      const next = [...blocks]
      next.splice(idx + 1, 0, newBlock)
      onChange(next)
      requestAnimationFrame(() => {
        const el = blockRefs.current.get(newBlock.id)
        if (el) moveCaretToEnd(el)
      })
      return newBlock.id
    },
    [blocks, onChange]
  )

  const focusBlock = useCallback((id: string, atEnd = true) => {
    requestAnimationFrame(() => {
      const el = blockRefs.current.get(id)
      if (!el) return
      if (atEnd) moveCaretToEnd(el)
      else moveCaretToStart(el)
    })
  }, [])

  const handleInput = useCallback(
    (id: string, e: React.FormEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      const text = getTextContent(el)

      if (text.startsWith("/") && !slashOpen) {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          setSlashPos({ x: rect.left, y: rect.bottom + 4 })
        }
        setSlashOpen(true)
        setSlashBlockId(id)
        setSlashQuery(text.slice(1))
        return
      }

      if (slashOpen && slashBlockId === id) {
        if (text.startsWith("/")) {
          setSlashQuery(text.slice(1))
        } else {
          setSlashOpen(false)
          setSlashBlockId(null)
        }
      }
    },
    [slashOpen, slashBlockId]
  )

  const handleSlashSelect = useCallback(
    (type: BlockType) => {
      if (!slashBlockId) return
      const el = blockRefs.current.get(slashBlockId)
      if (el) el.textContent = ""
      updateBlock(slashBlockId, {
        type,
        content: [{ text: "", styles: [] }],
      })
      setSlashOpen(false)
      setSlashBlockId(null)
      setSlashPos(null)
      focusBlock(slashBlockId)
    },
    [slashBlockId, updateBlock, focusBlock]
  )

  const handleSlashClose = useCallback(() => {
    setSlashOpen(false)
    setSlashBlockId(null)
    setSlashPos(null)
    if (slashBlockId) focusBlock(slashBlockId)
  }, [slashBlockId, focusBlock])

  const handleBlockBlur = useCallback(
    (id: string, e: React.FocusEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      const text = getTextContent(el)
      const block = blocks.find((b) => b.id === id)
      if (block && text !== (block.content[0]?.text ?? "")) {
        updateBlock(id, { content: [{ text, styles: [] }] })
      }
    },
    [blocks, updateBlock]
  )

  const handleKeyDown = useCallback(
    (id: string, e: KeyboardEvent<HTMLDivElement>) => {
      const block = blocks.find((b) => b.id === id)
      if (!block) return
      const el = blockRefs.current.get(id)
      if (!el) return

      if (e.key === "Escape" && slashOpen) {
        e.preventDefault()
        setSlashOpen(false)
        setSlashBlockId(null)
        return
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (slashOpen) return
        e.preventDefault()

        if (block.type === "code") {
          document.execCommand("insertText", false, "\n")
          return
        }

        const sel = window.getSelection()
        const hasCaret = sel && sel.rangeCount > 0
        const range = hasCaret ? sel.getRangeAt(0) : null

        if (
          block.type === "bulletedList" ||
          block.type === "numberedList" ||
          block.type === "todo"
        ) {
          const text = getTextContent(el)
          if (!text) {
            onChange(
              blocks.map((b) =>
                b.id === id
                  ? { ...b, type: "paragraph" as BlockType, content: [{ text: "", styles: [] }] }
                  : b
              )
            )
            el.textContent = ""
            return
          }
          const idx = blocks.findIndex((b) => b.id === id)
          const newBlock = createBlock(block.type)
          const next = [...blocks]
          next.splice(idx + 1, 0, newBlock)
          onChange(next)
          requestAnimationFrame(() => {
            const nel = blockRefs.current.get(newBlock.id)
            if (nel) moveCaretToEnd(nel)
          })
        } else if (range) {
          const postRange = document.createRange()
          postRange.selectNodeContents(el)
          postRange.setStart(range.endContainer, range.endOffset)
          const remaining = postRange.toString()

          const preRange = document.createRange()
          preRange.selectNodeContents(el)
          preRange.setEnd(range.startContainer, range.startOffset)
          const beforeText = preRange.toString()

          postRange.deleteContents()

          const newBlock = createBlock("paragraph", remaining ? [{ text: remaining, styles: [] }] : undefined)
          const idx = blocks.findIndex((b) => b.id === id)
          const next = blocks.map((b) =>
            b.id === id ? { ...b, content: [{ text: beforeText, styles: [] }] } : b
          )
          next.splice(idx + 1, 0, newBlock)
          onChange(next)
          requestAnimationFrame(() => {
            const nel = blockRefs.current.get(newBlock.id)
            if (nel) moveCaretToEnd(nel)
          })
        } else {
          const newBlock = createBlock("paragraph")
          const idx = blocks.findIndex((b) => b.id === id)
          const next = [...blocks]
          next.splice(idx + 1, 0, newBlock)
          onChange(next)
          requestAnimationFrame(() => {
            const nel = blockRefs.current.get(newBlock.id)
            if (nel) moveCaretToEnd(nel)
          })
        }
      }

      if (e.key === "Backspace" && !e.shiftKey) {
        const sel = window.getSelection()
        if (sel && sel.isCollapsed && caretIsAtStart(el)) {
          e.preventDefault()
          if (block.type !== "paragraph") {
            onChange(
              blocks.map((b) =>
                b.id === id
                  ? { ...b, type: "paragraph" as BlockType, content: [{ text: getTextContent(el), styles: [] }] }
                  : b
              )
            )
          } else {
            const idx = blocks.findIndex((b) => b.id === id)
            if (idx > 0) {
              const prev = blocks[idx - 1]
              const prevText = prev.content.map((s) => s.text).join("")
              const curText = getTextContent(el)
              const merged = prevText + curText
              const next = blocks
                .filter((b) => b.id !== id)
                .map((b) =>
                  b.id === prev.id
                    ? { ...b, content: [{ text: merged, styles: [] }] }
                    : b
                )
              onChange(next)
              const prevEl = blockRefs.current.get(prev.id)
              if (prevEl) {
                prevEl.textContent = merged
                requestAnimationFrame(() => {
                  prevEl.focus()
                  const range = document.createRange()
                  const newSel = window.getSelection()
                  const textNode = prevEl.firstChild ?? prevEl
                  range.setStart(textNode, prevText.length)
                  range.collapse(true)
                  newSel?.removeAllRanges()
                  newSel?.addRange(range)
                })
              }
            }
          }
        }
      }

      if (e.key === "Delete" && !e.shiftKey) {
        const sel = window.getSelection()
        if (sel && sel.isCollapsed && caretIsAtEnd(el)) {
          e.preventDefault()
          const idx = blocks.findIndex((b) => b.id === id)
          if (idx < blocks.length - 1) {
            const next = blocks[idx + 1]
            const curText = getTextContent(el)
            const nextText = next.content.map((s) => s.text).join("")
            const merged = curText + nextText
            const updated = blocks
              .filter((b) => b.id !== next.id)
              .map((b) =>
                b.id === id
                  ? { ...b, content: [{ text: merged, styles: [] }] }
                  : b
              )
            onChange(updated)
            el.textContent = merged
            requestAnimationFrame(() => {
              el.focus()
              const range = document.createRange()
              const newSel = window.getSelection()
              const textNode = el.firstChild ?? el
              range.setStart(textNode, curText.length)
              range.collapse(true)
              newSel?.removeAllRanges()
              newSel?.addRange(range)
            })
          }
        }
      }

      if (e.key === "ArrowUp") {
        const sel = window.getSelection()
        if (
          sel &&
          sel.isCollapsed &&
          caretIsAtStart(el)
        ) {
          e.preventDefault()
          const idx = blocks.findIndex((b) => b.id === id)
          if (idx > 0) {
            focusBlock(blocks[idx - 1].id, true)
          }
        }
      }

      if (e.key === "ArrowDown") {
        const sel = window.getSelection()
        if (
          sel &&
          sel.isCollapsed &&
          caretIsAtEnd(el)
        ) {
          e.preventDefault()
          const idx = blocks.findIndex((b) => b.id === id)
          if (idx < blocks.length - 1) {
            focusBlock(blocks[idx + 1].id, false)
          }
        }
      }

      if (e.key === " " && !slashOpen) {
        const text = getTextContent(el)
        const match = detectMarkdownShortcut(text)
        if (match) {
          e.preventDefault()
          el.textContent = ""
          updateBlock(id, {
            type: match.type,
            content: [{ text: text.slice(match.prefixLength), styles: [] }],
          })
          requestAnimationFrame(() => {
            if (match.type === "code") {
              el.textContent = ""
            }
            moveCaretToEnd(el)
          })
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        document.execCommand("bold")
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault()
        document.execCommand("italic")
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "u") {
        e.preventDefault()
        document.execCommand("underline")
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault()
        document.execCommand("strikeThrough")
      }
    },
    [
      blocks,
      slashOpen,
      insertBlockAfter,
      updateBlock,
      focusBlock,
      onChange,
    ]
  )

  const handlePaste = useCallback((_id: string, e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }, [])

  const handleFocus = useCallback((id: string) => {
    setFocusedId(id)
  }, [])

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setToolbarPos(null)
      setActiveFormats(new Set())
      return
    }
    const range = sel.getRangeAt(0)
    if (!editorRef.current?.contains(range.commonAncestorContainer)) {
      setToolbarPos(null)
      setActiveFormats(new Set())
      return
    }
    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setToolbarPos(null)
      return
    }
    setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })

    const formats = new Set<string>()
    if (document.queryCommandState("bold")) formats.add("bold")
    if (document.queryCommandState("italic")) formats.add("italic")
    if (document.queryCommandState("underline")) formats.add("underline")
    if (document.queryCommandState("strikeThrough"))
      formats.add("strikethrough")
    setActiveFormats(formats)
  }, [])

  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [handleSelectionChange])

  const handleFormat = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
  }, [])

  useEffect(() => {
    if (blocks.length === 0) {
      onChange([createBlock("paragraph")])
    }
  }, [])

  const handleTodoToggle = useCallback(
    (id: string) => {
      const block = blocks.find((b) => b.id === id)
      if (block) {
        updateBlock(id, { checked: !block.checked })
      }
    },
    [blocks, updateBlock]
  )

  return (
    <div className={cn("relative", className)}>
      {toolbarPos && (
        <RichTextToolbar
          position={toolbarPos}
          activeFormats={activeFormats}
          onFormat={handleFormat}
          onClose={() => setToolbarPos(null)}
        />
      )}

      {slashOpen && slashBlockId && (
        <SlashCommandMenu
          query={slashQuery}
          position={slashPos}
          onSelect={handleSlashSelect}
          onClose={handleSlashClose}
        />
      )}

      <div ref={editorRef} className="space-y-0.5">
        {blocks.map((block) => {
          const isFocused = focusedId === block.id
          const isHovered = hoveredId === block.id
          const placeholder = getBlockPlaceholder(block.type)

          if (block.type === "divider") {
            return (
              <div
                key={block.id}
                className="group relative flex items-center py-3"
                onMouseEnter={() => setHoveredId(block.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="absolute -left-7 top-1/2 flex -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    className="flex size-6 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
                    onClick={() => {
                      updateBlock(block.id, { type: "paragraph" })
                      focusBlock(block.id)
                    }}
                  >
                    <icons.moreVertical className="size-3.5" />
                  </button>
                </div>
                <hr className="flex-1 border-border/60" />
              </div>
            )
          }

          return (
            <div
              key={block.id}
              className="group relative flex items-start"
              onMouseEnter={() => setHoveredId(block.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={cn(
                  "absolute -left-7 top-0.5 flex gap-0.5 transition-opacity",
                  isHovered || isFocused ? "opacity-100" : "opacity-0"
                )}
              >
                <button
                  type="button"
                  className="flex size-6 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
                  title="Add block below"
                  onClick={() => {
                    const newId = insertBlockAfter(block.id)
                    focusBlock(newId)
                  }}
                >
                  <icons.plus className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="flex size-6 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
                  title="Drag to reorder"
                >
                  <icons.moreVertical className="size-3.5" />
                </button>
              </div>

              {block.type === "bulletedList" && (
                <span className="mt-[5px] mr-1.5 flex size-5 shrink-0 items-center justify-center text-sm text-muted-foreground select-none">
                  •
                </span>
              )}

              {block.type === "numberedList" && (
                <span className="mt-[3px] mr-1.5 flex size-5 shrink-0 items-center justify-center text-sm font-medium text-muted-foreground select-none">
                  {blocks
                    .filter((b) => b.type === "numberedList")
                    .indexOf(block) + 1}
                  .
                </span>
              )}

              {block.type === "todo" && (
                <button
                  type="button"
                  className={cn(
                    "mt-[5px] mr-1.5 flex size-[18px] shrink-0 items-center justify-center rounded border-2 transition-colors",
                    block.checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 hover:border-muted-foreground/60"
                  )}
                  onClick={() => handleTodoToggle(block.id)}
                >
                  {block.checked && (
                    <svg className="size-3" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )}

              <div
                ref={getBlockRef(block.id)}
                className={cn(
                  "min-h-[1.5em] flex-1 rounded px-1 py-0.5 outline-none transition-colors empty:before:pointer-events-none empty:before:text-muted-foreground/40 empty:before:content-[attr(data-placeholder)]",
                  block.type === "heading1" &&
                    "py-2 font-heading text-2xl font-bold",
                  block.type === "heading2" &&
                    "py-1.5 font-heading text-xl font-semibold",
                  block.type === "heading3" &&
                    "py-1 font-heading text-lg font-medium",
                  block.type === "quote" &&
                    "border-l-4 border-primary/40 pl-4 text-muted-foreground italic",
                  block.type === "callout" &&
                    "rounded-lg border border-border/50 bg-muted/30 p-3",
                  block.type === "code" &&
                    "rounded-lg bg-muted/50 p-3 font-mono text-sm whitespace-pre",
                  isFocused && "bg-muted/30"
                )}
                contentEditable
                suppressContentEditableWarning
                data-block-id={block.id}
                data-placeholder={placeholder}
                onInput={(e) => handleInput(block.id, e)}
                onKeyDown={(e) => handleKeyDown(block.id, e)}
                onPaste={(e) => handlePaste(block.id, e)}
                onFocus={() => handleFocus(block.id)}
                onBlur={(e) => handleBlockBlur(block.id, e)}
                role="textbox"
                aria-label={`${block.type} block`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { BlockEditor }
