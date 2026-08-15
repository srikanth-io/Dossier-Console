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
}: LayersPanelProps) {
  if (elements.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <icons.layers className="size-6 text-muted-foreground/60" />
        <p className="text-xs font-medium text-muted-foreground">
          {messages.studio.editor.noElements}
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          {messages.studio.editor.noElementsHint}
        </p>
      </div>
    )
  }

  const ordered = [...elements].reverse()

  return (
    <div className="flex h-full flex-col overflow-y-auto p-2">
      {ordered.map((el) => {
        const definition = definitionFor(el.type)
        const Icon = icons[definition?.icon ?? "text"]
        const selected = selectedIds.includes(el.id)
        return (
          <div
            key={el.id}
            className={cn(
              "group flex items-center gap-1.5 rounded-md border px-1.5 py-1",
              selected
                ? "border-primary/60 bg-primary/5"
                : "border-transparent hover:bg-muted"
            )}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-0.5 text-left"
              onClick={() => onSelect(selected ? selectedIds.filter((id) => id !== el.id) : [el.id])}
            >
              <Icon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-medium">{el.name}</span>
            </button>

            <button
              type="button"
              title={el.locked ? "Unlock" : "Lock"}
              onClick={() => onToggleLocked(el.id)}
              className={cn(
                "flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100",
                el.locked && "text-primary opacity-100"
              )}
            >
              <icons.lock className="size-3.5" />
            </button>
            <button
              type="button"
              title={el.hidden ? "Show" : "Hide"}
              onClick={() => onToggleHidden(el.id)}
              className={cn(
                "flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100",
                el.hidden && "text-muted-foreground opacity-100"
              )}
            >
              <icons.eyeOff className="size-3.5" />
            </button>
            <button
              type="button"
              title={messages.studio.editor.duplicate}
              onClick={() => onDuplicate(el.id)}
              className="flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
            >
              <icons.copy className="size-3.5" />
            </button>
            <button
              type="button"
              title={messages.studio.editor.delete}
              onClick={() => onDelete([el.id])}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
            >
              <icons.trash className="size-3.5" />
            </button>
            <div className="flex flex-col">
              <button
                type="button"
                title="Move up"
                onClick={() => onReorder(el.id, "forward")}
                className="flex size-5 items-center justify-center rounded hover:bg-muted"
              >
                <icons.chevronUp className="size-3" />
              </button>
              <button
                type="button"
                title="Move down"
                onClick={() => onReorder(el.id, "backward")}
                className="flex size-5 items-center justify-center rounded hover:bg-muted"
              >
                <icons.chevronDown className="size-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
