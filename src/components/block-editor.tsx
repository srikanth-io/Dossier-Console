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
  type Block,
  type BlockType,
  type TextSegment,
} from "@/lib/blocks"
import { cn } from "@/lib/utils"
import { SlashCommandMenu } from "@/components/slash-command-menu"
import { RichTextToolbar } from "@/components/rich-text-toolbar"

type BlockEditorProps = {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  className?: string
}

function segmentsToHtml(segments: TextSegment[]): string {
  return segments
    .map((seg) => {
      let html = escapeHtml(seg.text)
      for (const s of seg.styles) {
        if (s.type === "bold") html = `<strong>${html}</strong>`
        else if (s.type === "italic") html = `<em>${html}</em>`
        else if (s.type === "underline") html = `<u>${html}</u>`
        else if (s.type === "strikethrough") html = `<s>${html}</s>`
        else if (s.type === "code") html = `<code>${html}</code>`
        else if (s.type === "link") html = `<a href="${escapeHtml(s.value ?? "#")}" class="text-primary underline">${html}</a>`
      }
      return html
    })
    .join("")
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function htmlToSegments(html: string): TextSegment[] {
  const tmp = document.createElement("div")
  tmp.innerHTML = html
  const segments: TextSegment[] = []
  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ""
      if (text) segments.push({ text, styles: [] })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    const childSegments: TextSegment[] = []
    el.childNodes.forEach(walk)
    if (childSegments.length === 0 && el.textContent) {
      childSegments.push({ text: el.textContent, styles: [] })
    }
    let styleType: TextSegment["styles"][number]["type"] | null = null
    if (tag === "strong" || tag === "b") styleType = "bold"
    else if (tag === "em" || tag === "i") styleType = "italic"
    else if (tag === "u") styleType = "underline"
    else if (tag === "s" || tag === "del") styleType = "strikethrough"
    else if (tag === "code") styleType = "code"
    else if (tag === "a") {
      const href = el.getAttribute("href") ?? "#"
      for (const cs of childSegments) {
        segments.push({ text: cs.text, styles: [...cs.styles, { type: "link", value: href }] })
      }
      return
    }
    if (styleType) {
      for (const cs of childSegments) {
        segments.push({ text: cs.text, styles: [...cs.styles, { type: styleType }] })
      }
    } else {
      segments.push(...childSegments)
    }
  }
  walk(tmp)
  if (segments.length === 0) segments.push({ text: "", styles: [] })
  return segments
}

function getBlockPlaceholder(type: BlockType): string {
  switch (type) {
    case "paragraph": return "Type '/' for commands…"
    case "heading1": return "Heading 1"
    case "heading2": return "Heading 2"
    case "heading3": return "Heading 3"
    case "bulletedList": return "List item"
    case "numberedList": return "List item"
    case "todo": return "To-do"
    case "toggle": return "Toggle"
    case "quote": return "Quote"
    case "callout": return "Callout"
    case "code": return "Code"
    default: return ""
  }
}

export function BlockEditor({ blocks, onChange, className }: BlockEditorProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashBlockId, setSlashBlockId] = useState<string | null>(null)
  const [slashQuery, setSlashQuery] = useState("")
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const editorRef = useRef<HTMLDivElement>(null)
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const getBlockRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) blockRefs.current.set(id, el)
    else blockRefs.current.delete(id)
  }, [])

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }, [blocks, onChange])

  const insertBlockAfter = useCallback((afterId: string, type: BlockType = "paragraph") => {
    const newBlock = createBlock(type)
    const idx = blocks.findIndex((b) => b.id === afterId)
    const next = [...blocks]
    next.splice(idx + 1, 0, newBlock)
    onChange(next)
    requestAnimationFrame(() => {
      const el = blockRefs.current.get(newBlock.id)
      el?.focus()
    })
  }, [blocks, onChange])

  const removeBlock = useCallback((id: string) => {
    if (blocks.length <= 1) return
    const idx = blocks.findIndex((b) => b.id === id)
    const prev = blocks[idx - 1]
    const next = blocks.filter((b) => b.id !== id)
    onChange(next)
    if (prev) {
      requestAnimationFrame(() => {
        const el = blockRefs.current.get(prev.id)
        el?.focus()
        const range = document.createRange()
        const sel = window.getSelection()
        if (el && sel) {
          range.selectNodeContents(el)
          range.collapse(false)
          sel.removeAllRanges()
          sel.addRange(range)
        }
      })
    }
  }, [blocks, onChange])

  const handleInput = useCallback((id: string, e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const html = el.innerHTML
    const text = el.textContent ?? ""

    if (text.startsWith("/") && !slashOpen) {
      setSlashOpen(true)
      setSlashBlockId(id)
      setSlashQuery(text.slice(1))
      return
    }
    if (slashOpen && slashBlockId === id) {
      setSlashQuery(text.startsWith("/") ? text.slice(1) : "")
      if (!text.startsWith("/")) {
        setSlashOpen(false)
      }
    }

    const segments = htmlToSegments(html)
    updateBlock(id, { content: segments })
  }, [updateBlock, slashOpen, slashBlockId])

  const handleSlashSelect = useCallback((type: BlockType) => {
    if (!slashBlockId) return
    updateBlock(slashBlockId, {
      type,
      content: [{ text: "", styles: [] }],
    })
    setSlashOpen(false)
    setSlashBlockId(null)
    requestAnimationFrame(() => {
      const el = blockRefs.current.get(slashBlockId)
      if (el) {
        el.focus()
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(el)
        range.collapse(false)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    })
  }, [slashBlockId, updateBlock])

  const handleKeyDown = useCallback((id: string, e: KeyboardEvent<HTMLDivElement>) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return

    if (e.key === "Enter" && !e.shiftKey) {
      if (slashOpen) return
      e.preventDefault()
      if (block.type === "bulletedList" || block.type === "numberedList" || block.type === "todo") {
        const text = block.content.map((s) => s.text).join("")
        if (!text) {
          updateBlock(id, { type: "paragraph", content: [{ text: "", styles: [] }] })
          return
        }
        insertBlockAfter(id, block.type)
      } else {
        insertBlockAfter(id)
      }
    }

    if (e.key === "Backspace") {
      const el = blockRefs.current.get(id)
      if (el) {
        const sel = window.getSelection()
        if (sel && sel.isCollapsed) {
          const range = sel.getRangeAt(0)
          if (range.startOffset === 0 && el.textContent === "") {
            e.preventDefault()
            if (block.type !== "paragraph") {
              updateBlock(id, { type: "paragraph" })
            } else {
              removeBlock(id)
            }
          } else if (range.startOffset === 0 && block.type !== "paragraph") {
            e.preventDefault()
            updateBlock(id, { type: "paragraph" })
          }
        }
      }
    }

    if (e.key === "ArrowUp") {
      const idx = blocks.findIndex((b) => b.id === id)
      if (idx > 0) {
        const prev = blocks[idx - 1]
        blockRefs.current.get(prev.id)?.focus()
      }
    }

    if (e.key === "ArrowDown") {
      const idx = blocks.findIndex((b) => b.id === id)
      if (idx < blocks.length - 1) {
        const next = blocks[idx + 1]
        blockRefs.current.get(next.id)?.focus()
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
  }, [blocks, slashOpen, insertBlockAfter, updateBlock, removeBlock])

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
    const rect = range.getBoundingClientRect()
    setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })

    const formats = new Set<string>()
    if (document.queryCommandState("bold")) formats.add("bold")
    if (document.queryCommandState("italic")) formats.add("italic")
    if (document.queryCommandState("underline")) formats.add("underline")
    if (document.queryCommandState("strikeThrough")) formats.add("strikethrough")
    setActiveFormats(formats)
  }, [])

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
          onSelect={handleSlashSelect}
          onClose={() => {
            setSlashOpen(false)
            setSlashBlockId(null)
          }}
        />
      )}

      <div ref={editorRef} className="space-y-0.5">
        {blocks.map((block) => {
          const isFocused = focusedId === block.id
          const placeholder = getBlockPlaceholder(block.type)

          if (block.type === "divider") {
            return (
              <div
                key={block.id}
                ref={getBlockRef(block.id)}
                className="py-2"
                contentEditable
                suppressContentEditableWarning
                onFocus={() => handleFocus(block.id)}
                onKeyDown={(e) => handleKeyDown(block.id, e)}
                data-block-id={block.id}
              >
                <hr className="border-border/60" />
              </div>
            )
          }

          return (
            <div
              key={block.id}
              ref={getBlockRef(block.id)}
              className={cn(
                "group relative min-h-[1.5em] rounded px-1 py-0.5 outline-none transition-colors",
                "focus:bg-muted/30",
                block.type === "heading1" && "py-2 font-heading text-2xl font-bold",
                block.type === "heading2" && "py-1.5 font-heading text-xl font-semibold",
                block.type === "heading3" && "py-1 font-heading text-lg font-medium",
                block.type === "quote" && "border-l-4 border-primary/40 pl-4 text-muted-foreground italic",
                block.type === "callout" && "rounded-lg border border-border/50 bg-muted/30 p-3",
                block.type === "code" && "rounded-lg bg-muted/50 p-3 font-mono text-sm",
                (block.type === "bulletedList" || block.type === "numberedList") && "pl-6",
                block.type === "todo" && "flex items-start gap-2",
                isFocused && "bg-muted/30"
              )}
              contentEditable
              suppressContentEditableWarning
              data-block-id={block.id}
              onInput={(e) => handleInput(block.id, e)}
              onKeyDown={(e) => handleKeyDown(block.id, e)}
              onPaste={(e) => handlePaste(block.id, e)}
              onFocus={() => handleFocus(block.id)}
              dangerouslySetInnerHTML={{
                __html: segmentsToHtml(block.content),
              }}
              data-placeholder={placeholder}
              role="textbox"
              aria-label={`${block.type} block`}
            />
          )
        })}
      </div>
    </div>
  )
}
