import { useState } from "react"

import { icons, messages } from "@/constants"
import type { MyComponent } from "@/document-engine/types"
import {
  CATEGORY_ORDER,
  CATEGORY_META,
  elementCatalog,
} from "@/document-engine/registry"
import { cn } from "@/lib/utils"

interface PalettePanelProps {
  onAddType: (type: string) => void
  components: MyComponent[]
  onAddComponent: (component: MyComponent) => void
}

export function PalettePanel({
  onAddType,
  components,
  onAddComponent,
}: PalettePanelProps) {
  const [tab, setTab] = useState<"elements" | "saved">("elements")

  const categories = CATEGORY_ORDER.filter((category) =>
    Object.values(elementCatalog).some(
      (definition) => definition.category === category
    )
  )

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-2 gap-1 border-b bg-muted/30 p-1.5">
        <button
          type="button"
          onClick={() => setTab("elements")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
            tab === "elements"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <icons.layers className="size-3.5" />
          {messages.studio.editor.elements}
        </button>
        <button
          type="button"
          onClick={() => setTab("saved")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
            tab === "saved"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <icons.sparkles className="size-3.5" />
          {messages.studio.editor.myComponents}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === "elements" ? (
          <div className="space-y-4">
            {categories.map((category) => {
              const meta = CATEGORY_META[category]
              const items = Object.values(elementCatalog).filter(
                (definition) => definition.category === category
              )
              return (
                <div key={category}>
                  <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {meta.label}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {items.map((definition) => {
                      const Icon = icons[definition.icon]
                      return (
                        <button
                          key={definition.type}
                          type="button"
                          draggable
                          title={definition.description}
                          onClick={() => onAddType(definition.type)}
                          onDragStart={(event) => {
                            event.dataTransfer.setData(
                              "application/x-doc-element",
                              definition.type
                            )
                            event.dataTransfer.effectAllowed = "copy"
                          }}
                          className="group flex min-h-12 cursor-grab flex-col items-center justify-center gap-1 rounded-lg border border-border/60 bg-card px-1 py-2 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:cursor-grabbing"
                        >
                          <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                          <span className="text-[10px] leading-tight text-foreground">
                            {definition.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : components.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
            {messages.studio.editor.myComponentsEmpty}
          </div>
        ) : (
          <div className="space-y-1.5">
            {components.map((component) => (
              <button
                key={component.id}
                type="button"
                draggable
                onClick={() => onAddComponent(component)}
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/x-doc-component",
                    component.id
                  )
                  event.dataTransfer.effectAllowed = "copy"
                }}
                className="flex w-full cursor-grab items-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-2 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:cursor-grabbing"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <icons.text className="size-3.5" />
                </span>
                <span className="truncate text-xs font-medium">{component.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
