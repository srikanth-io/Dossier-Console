import { useState } from "react"

import { Input } from "@/components/ui/input"
import { icons, messages } from "@/constants"
import type { DocElement } from "@/document-engine/types"
import { definitionFor } from "@/document-engine/registry"
import { cn } from "@/lib/utils"

interface LayersPanelProps {
  elements: DocElement[]
  selectedIds: string[]
  onSelect: (ids: string[]) => void
  onToggleHidden: (id: string) => void
  onToggleLocked: (id: string) => void
  onReorder: (id: string, direction: "front" | "forward" | "backward" | "back") => void
  onDuplicate: (id: string) => void
  onDelete: (ids: string[]) => void
  onRename?: (id: string, name: string) => void
}

export function LayersPanel({
  elements,
  selectedIds,
  onSelect,
  onToggleHidden,
  onToggleLocked,
  onReorder,
  onDuplicate,
  onDelete,
  onRename,
}: LayersPanelProps) {
  const editor = messages.studio.editor
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  if (elements.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <icons.layers className="size-5 text-muted-foreground" />
        </span>
        <p className="text-xs font-medium text-muted-foreground">
          {editor.noElements}
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          {editor.noElementsHint}
        </p>
      </div>
    )
  }

  const ordered = [...elements].reverse()

  const commitRename = (id: string) => {
    if (onRename && renameValue.trim() && renameValue.trim() !== id) {
      onRename(id, renameValue.trim())
    }
    setRenamingId(null)
  }

  const handleDrop = (target: DocElement, event: React.DragEvent) => {
    event.preventDefault()
    const from = ordered.findIndex((item) => item.id === draggingId)
    const to = ordered.findIndex((item) => item.id === target.id)
    setDraggingId(null)
    if (from === -1 || to === -1 || from === to) return
    if (to < from) {
      for (let i = 0; i < from - to; i++) onReorder(draggingId as string, "forward")
    } else {
      for (let i = 0; i < to - from; i++) onReorder(draggingId as string, "backward")
    }
  }

  const controlClass = "flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"

  return (
    <div className="flex h-full flex-col overflow-y-auto p-2">
      <div className="space-y-0.5">
        {ordered.map((el) => {
          const definition = definitionFor(el.type)
          const Icon = icons[definition?.icon ?? "text"]
          const selected = selectedIds.includes(el.id)
          const renaming = renamingId === el.id
          return (
            <div
              key={el.id}
              draggable
              onDragStart={() => setDraggingId(el.id)}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = "move"
              }}
              onDrop={(event) => handleDrop(el, event)}
              onDragEnd={() => setDraggingId(null)}
              className={cn(
                "group relative flex h-9 cursor-grab items-center gap-0.5 rounded-lg pl-3 pr-1 transition-colors active:cursor-grabbing",
                draggingId === el.id && "opacity-50",
                selected ? "bg-primary-soft" : "hover:bg-muted/70"
              )}
            >
              {selected && (
                <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              )}
              <icons.templates className="size-3 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left"
                onClick={() =>
                  onSelect(selected ? selectedIds.filter((id) => id !== el.id) : [el.id])
                }
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    selected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {renaming ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onBlur={() => commitRename(el.id)}
                    onPointerDown={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      event.stopPropagation()
                      if (event.key === "Enter") {
                        event.preventDefault()
                        commitRename(el.id)
                      } else if (event.key === "Escape") {
                        event.preventDefault()
                        setRenamingId(null)
                      }
                    }}
                    className="h-6 px-1.5 text-xs"
                  />
                ) : (
                  <span
                    className={cn(
                      "truncate text-xs font-medium",
                      selected && "text-primary"
                    )}
                  >
                    {el.name}
                  </span>
                )}
              </button>

              <button
                type="button"
                title={el.hidden ? editor.show : editor.hide}
                onClick={() => onToggleHidden(el.id)}
                className={cn(
                  controlClass,
                  el.hidden ? "opacity-100 text-foreground" : "text-muted-foreground"
                )}
              >
                {el.hidden ? <icons.eyeOff className="size-3.5" /> : <icons.eye className="size-3.5" />}
              </button>
              <button
                type="button"
                title={el.locked ? editor.unlock : editor.lock}
                onClick={() => onToggleLocked(el.id)}
                className={cn(
                  controlClass,
                  el.locked && "opacity-100 text-primary"
                )}
              >
                <icons.lock className="size-3.5" />
              </button>
              {onRename && (
                <button
                  type="button"
                  title={editor.rename}
                  onClick={() => {
                    setRenameValue(el.name)
                    setRenamingId(el.id)
                  }}
                  className={controlClass}
                >
                  <icons.pencil className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                title={editor.duplicate}
                onClick={() => onDuplicate(el.id)}
                className={controlClass}
              >
                <icons.copy className="size-3.5" />
              </button>
              <button
                type="button"
                title={editor.delete}
                onClick={() => onDelete([el.id])}
                className={cn(
                  controlClass,
                  "hover:bg-destructive/10 hover:text-destructive"
                )}
              >
                <icons.trash className="size-3.5" />
              </button>
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  title={editor.moveUp}
                  onClick={() => onReorder(el.id, "forward")}
                  className="flex size-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 hover:bg-muted group-hover:opacity-100"
                >
                  <icons.chevronUp className="size-3" />
                </button>
                <button
                  type="button"
                  title={editor.moveDown}
                  onClick={() => onReorder(el.id, "backward")}
                  className="flex size-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 hover:bg-muted group-hover:opacity-100"
                >
                  <icons.chevronDown className="size-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
