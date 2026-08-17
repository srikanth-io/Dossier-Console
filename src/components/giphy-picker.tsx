import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type GifItem = {
  id: string
  url: string
  preview: string
  title: string
  tags: string[]
}

const MOCK_GIFS: GifItem[] = [
  { id: "1", url: "https://media.giphy.com/media/3o7aD4GAAx7Oe2MF5m/giphy.gif", preview: "https://media.giphy.com/media/3o7aD4GAAx7Oe2MF5m/200.gif", title: "thumbs up", tags: ["thumbs", "up", "approve"] },
  { id: "2", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", preview: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif", title: "cat typing", tags: ["cat", "typing", "keyboard"] },
  { id: "3", url: "https://media.giphy.com/media/3o7TKDEzKwRkU1n3sY/giphy.gif", preview: "https://media.giphy.com/media/3o7TKDEzKwRkU1n3sY/200.gif", title: "celebration", tags: ["celebrate", "party", "confetti"] },
  { id: "4", url: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif", preview: "https://media.giphy.com/media/5GoVLqeAOo6PK/200.gif", title: "mind blown", tags: ["mind", "blown", "wow"] },
  { id: "5", url: "https://media.giphy.com/media/l4FGI2HnlKMbZAFDi/giphy.gif", preview: "https://media.giphy.com/media/l4FGI2HnlKMbZAFDi/200.gif", title: "coding", tags: ["code", "programming", "dev"] },
  { id: "6", url: "https://media.giphy.com/media/26ufdIPQnU26fLXVf/giphy.gif", preview: "https://media.giphy.com/media/26ufdIPQnU26fLXVf/200.gif", title: "coffee", tags: ["coffee", "drink", "morning"] },
  { id: "7", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", preview: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif", title: "fire", tags: ["fire", "hot", "lit"] },
  { id: "8", url: "https://media.giphy.com/media/l4FGtYp4JjRZK4b5m/giphy.gif", preview: "https://media.giphy.com/media/l4FGtYp4JjRZK4b5m/200.gif", title: "rocket", tags: ["rocket", "launch", "space"] },
  { id: "9", url: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif", preview: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/200.gif", title: "star", tags: ["star", "sparkle", "shine"] },
  { id: "10", url: "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif", preview: "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/200.gif", title: "check mark", tags: ["check", "done", "complete"] },
  { id: "11", url: "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif", preview: "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/200.gif", title: "dancing", tags: ["dance", "happy", "party"] },
  { id: "12", url: "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif", preview: "https://media.giphy.com/media/26BRBKqUiq586bRVm/200.gif", title: "lightbulb", tags: ["idea", "lightbulb", "think"] },
  { id: "13", url: "https://media.giphy.com/media/3o7aCTfyhYawMw0BVu/giphy.gif", preview: "https://media.giphy.com/media/3o7aCTfyhYawMw0BVu/200.gif", title: "noted", tags: ["note", "write", "document"] },
  { id: "14", url: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif", preview: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/200.gif", title: "deal with it", tags: ["cool", "deal", "sunglasses"] },
  { id: "15", url: "https://media.giphy.com/media/26BRBRHpSΨΨΨΨΨ/giphy.gif", preview: "https://media.giphy.com/media/26BRBRHpSΨΨΨΨΨ/200.gif", title: "thumbs down", tags: ["thumbs", "down", "no"] },
  { id: "16", url: "https://media.giphy.com/media/3o6Zt4JVcRGvJ4rvM8/giphy.gif", preview: "https://media.giphy.com/media/3o6Zt4JVcRGvJ4rvM8/200.gif", title: "waving", tags: ["wave", "hello", "hi"] },
]

type GiphyPickerProps = {
  onSelect: (url: string) => void
  className?: string
}

export function GiphyPicker({ onSelect, className }: GiphyPickerProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_GIFS
    const q = search.toLowerCase()
    return MOCK_GIFS.filter(
      (gif) =>
        gif.title.toLowerCase().includes(q) ||
        gif.tags.some((t) => t.includes(q))
    )
  }, [search])

  return (
    <div
      className={cn(
        "flex w-80 flex-col overflow-hidden rounded-xl border border-border/60 bg-popover shadow-xl animate-in fade-in slide-in-from-top-2",
        className
      )}
    >
      <div className="border-b border-border/50 px-3 py-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search GIFs…"
          className="h-8 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="grid max-h-72 grid-cols-4 gap-1 overflow-y-auto p-2">
        {filtered.map((gif) => (
          <button
            key={gif.id}
            type="button"
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-transparent transition-all hover:border-primary/60 hover:shadow-md"
            onClick={() => onSelect(gif.url)}
          >
            <img
              src={gif.preview}
              alt={gif.title}
              className="size-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <span className="w-full truncate px-1.5 py-1 text-[10px] font-medium text-white">
                {gif.title}
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 py-8 text-center text-sm text-muted-foreground">
            No GIFs found
          </div>
        )}
      </div>
    </div>
  )
}
