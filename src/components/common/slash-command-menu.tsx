import { useEffect, useMemo, useRef, useState } from "react"

import { BLOCK_TYPES, type BlockType } from "@/lib/blocks"
import { cn } from "@/lib/utils"

type SlashCommandMenuProps = {
  query: string
  position?: { x: number; y: number } | null
  onSelect: (type: BlockType) => void
  onClose: () => void
}

function fuzzyScore(text: string, query: string): number {
  if (!query) return 0
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  let qi = 0
  let score = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 10
      qi++
    }
  }
  return qi === q.length ? score : 0
}

export function SlashCommandMenu({
  query,
  position,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return BLOCK_TYPES
    return BLOCK_TYPES.filter((b) => {
      const labelScore = fuzzyScore(b.label, q)
      const categoryScore = fuzzyScore(b.category, q)
      const descScore = fuzzyScore(b.description, q)
      return labelScore > 0 || categoryScore > 0 || descScore > 0
    }).sort((a, b) => {
      const aScore = Math.max(
        fuzzyScore(a.label, q),
        fuzzyScore(a.category, q),
        fuzzyScore(a.description, q)
      )
      const bScore = Math.max(
        fuzzyScore(b.label, q),
        fuzzyScore(b.category, q),
        fuzzyScore(b.description, q)
      )
      return bScore - aScore
    })
  }, [query])

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  useEffect(() => {
    const el = listRef.current?.children[selectedIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [selectedIdx])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIdx((i) => (i + 1) % filtered.length)
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIdx((i) => (i - 1 + filtered.length) % filtered.length)
      }
      if (e.key === "Enter") {
        e.preventDefault()
        if (filtered[selectedIdx]) {
          onSelect(filtered[selectedIdx].type)
        }
      }
    }
    document.addEventListener("keydown", handleKey, true)
    return () => document.removeEventListener("keydown", handleKey, true)
  }, [filtered, selectedIdx, onSelect, onClose])

  const categories = useMemo(() => {
    const cats: { category: string; items: typeof BLOCK_TYPES }[] = []
    let current = ""
    for (const item of filtered) {
      if (item.category !== current) {
        current = item.category
        cats.push({ category: current, items: [] })
      }
      cats[cats.length - 1].items.push(item)
    }
    return cats
  }, [filtered])

  let globalIdx = -1

  const posStyle: React.CSSProperties = position
    ? {
        position: "fixed",
        left: `${Math.min(position.x, window.innerWidth - 320)}px`,
        top: `${Math.min(position.y, window.innerHeight - 340)}px`,
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }

  return (
    <div
      className="fixed z-50 w-80 overflow-hidden rounded-xl border border-border/60 bg-popover shadow-xl animate-in fade-in slide-in-from-top-2"
      style={posStyle}
    >
      <div className="border-b border-border/50 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">
          Block types
        </p>
      </div>
      <div ref={listRef} className="max-h-80 overflow-y-auto p-1">
        {categories.map((cat) => (
          <div key={cat.category}>
            <p className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
              {cat.category}
            </p>
            {cat.items.map((item) => {
              globalIdx++
              const idx = globalIdx
              return (
                <button
                  key={item.type}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                    idx === selectedIdx
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => onSelect(item.type)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/50 text-xs font-medium">
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground/60">
                      {item.description}
                    </p>
                  </div>
                  {item.shortcut && (
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70">
                      {item.shortcut.trim()}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No blocks found
          </p>
        )}
      </div>
    </div>
  )
}
