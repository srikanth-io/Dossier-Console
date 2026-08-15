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
      <div className="grid grid-cols-2 gap-1 border-b p-2">
        <button
          type="button"
          onClick={() => setTab("elements")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
            tab === "elements"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
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
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
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
                  <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
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
                          className="group flex flex-col items-center gap-1 rounded-lg border bg-background px-1 py-2 text-center hover:border-primary/50 hover:bg-accent"
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
                className="flex w-full items-center gap-2 rounded-lg border bg-background px-2 py-2 text-left hover:border-primary/50 hover:bg-accent"
              >
                <icons.text className="size-4 text-muted-foreground" />
                <span className="truncate text-xs font-medium">{component.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
