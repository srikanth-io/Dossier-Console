import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { icons, messages, ROUTES } from "@/constants"
import { useDocumentHistory, uid } from "@/document-engine/history"
import { createPage } from "@/document-engine/defaults"
import {
  CATEGORY_META,
  cloneElement,
  createElement,
  elementCatalog,
} from "@/document-engine/registry"
import { exportDocumentToPdf } from "@/document-engine/export"
import { PageContent } from "@/document-engine/PageContent"
import { themePresetById } from "@/document-engine/themes"
import type { DocDocument, DocElement, DocPage, MyComponent } from "@/document-engine/types"
import { useDocumentLibrary } from "@/store/documents"
import { CanvasView } from "@/pages/studio/CanvasView"
import { PalettePanel } from "@/pages/studio/PalettePanel"
import { LayersPanel } from "@/pages/studio/LayersPanel"
import { PropertiesPanel } from "@/pages/studio/PropertiesPanel"
import { VariablesDialog } from "@/pages/studio/VariablesDialog"
import { VersionHistoryDialog } from "@/pages/studio/VersionHistoryDialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function bumpVersion(version: string): string {
  const parts = version.split(".")
  const major = Number(parts[0] ?? 1)
  const minor = Number(parts[1] ?? 0)
  return `${major}.${minor + 1}`
}

function relativeSaved(iso: number): string {
  const diff = Date.now() - iso
  if (diff < 1000) return messages.studio.editor.saveStatusSaved
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return messages.studio.editor.saveStatusAgo.replace("{time}", "< 1 min")
  return messages.studio.editor.saveStatusAgo.replace(
    "{time}",
    `${minutes} min`
  )
}

type PanelTab = "palette" | "layers"

const INSERT_CATEGORIES = ["basic", "layout", "data"] as const

function DocumentTitle({
  name,
  onRename,
}: {
  name: string
  onRename: (next: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const editor = messages.studio.editor

  useEffect(() => {
    if (editing) setValue(name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, editing])

  const commit = () => {
    setEditing(false)
    const next = value.trim()
    if (!next || next === name) return
    onRename(next)
  }

  if (editing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commit()
          } else if (event.key === "Escape") {
            event.preventDefault()
            setEditing(false)
          }
        }}
        placeholder={editor.renamePlaceholder}
        className="h-8 w-56 text-sm font-semibold"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setValue(name)
        setEditing(true)
      }}
      className="group flex max-w-56 min-w-0 cursor-text items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left hover:bg-muted"
      title={editor.renameDocument}
    >
      <span className="truncate text-sm font-semibold">{name}</span>
      <icons.pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}

function PanelTabs({
  panel,
  onChange,
}: {
  panel: PanelTab
  onChange: (panel: PanelTab) => void
}) {
  const editor = messages.studio.editor
  const tabClass = (active: boolean) =>
    cn(
      "flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
      active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
    )
  return (
    <div className="grid grid-cols-2 gap-1 border-b bg-muted/30 p-1.5">
      <button type="button" onClick={() => onChange("palette")} className={tabClass(panel === "palette")}>
        <icons.layers className="size-3.5" />
        {editor.elements}
      </button>
      <button type="button" onClick={() => onChange("layers")} className={tabClass(panel === "layers")}>
        <icons.pendingReviews className="size-3.5" />
        {editor.layers}
      </button>
    </div>
  )
}

export function DocumentEditor() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get("id") ?? ""
  const library = useDocumentLibrary()
  const libraryDoc = library.getDocument(id)

  const [pageIndex, setPageIndex] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [zoom, setZoom] = useState(0.7)
  const [previewMode, setPreviewMode] = useState(false)
  const [panel, setPanel] = useState<PanelTab>("palette")
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)
  const [variablesOpen, setVariablesOpen] = useState(false)
  const [versionsOpen, setVersionsOpen] = useState(false)
  const [componentOpen, setComponentOpen] = useState(false)
  const [componentName, setComponentName] = useState("")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [lastSavedAt, setLastSavedAt] = useState<number>(Date.now())
  const [exporting, setExporting] = useState(false)
  const [deletePageOpen, setDeletePageOpen] = useState(false)

  const clipboardRef = useRef<DocElement[]>([])
  const saveTimerRef = useRef<number | null>(null)

  const history = useDocumentHistory<DocDocument>(
    libraryDoc ?? (library.documents[0] as DocDocument | undefined) ?? ({} as DocDocument)
  )
  const doc = history.present
  const presentRef = useRef(doc)
  useEffect(() => {
    presentRef.current = doc
  }, [doc])

  const page = doc.pages[Math.min(pageIndex, Math.max(0, doc.pages.length - 1))] as DocPage | undefined
  const safePageIndex = page ? Math.min(pageIndex, doc.pages.length - 1) : 0

  const save = useCallback(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    library.saveDocument(presentRef.current)
    setSaveState("saved")
    setLastSavedAt(Date.now())
  }, [library])

  const renameDocument = useCallback(
    (name: string) => {
      const current = presentRef.current
      history.replace({ ...current, name })
      library.updateMeta(current.id, { name })
      setSaveState("saved")
      setLastSavedAt(Date.now())
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [library]
  )

  const scheduleSave = useCallback(() => {
    setSaveState("saving")
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(save, 800)
  }, [save])

  useEffect(() => {
    if (libraryDoc) {
      history.reset(structuredClone(libraryDoc))
      setPageIndex(0)
      setSelectedIds([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      if (libraryDoc) library.saveDocument(presentRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const isTyping = (target: EventTarget | null) => {
      const node = target as HTMLElement | null
      if (!node) return false
      return (
        node.tagName === "INPUT" ||
        node.tagName === "TEXTAREA" ||
        node.tagName === "SELECT" ||
        node.isContentEditable
      )
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (previewMode) {
        if (event.key === "Escape") setPreviewMode(false)
        return
      }
      if (!page) return
      if (isTyping(event.target)) return
      const mod = event.ctrlKey || event.metaKey

      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) history.redo()
        else history.undo()
        return
      }
      if (mod && event.key.toLowerCase() === "y") {
        event.preventDefault()
        history.redo()
        return
      }
      if (mod && event.key.toLowerCase() === "c") {
        copySelection()
        return
      }
      if (mod && event.key.toLowerCase() === "x") {
        event.preventDefault()
        cutSelection()
        return
      }
      if (mod && event.key.toLowerCase() === "v") {
        event.preventDefault()
        pasteClipboard()
        return
      }
      if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault()
        duplicateSelection()
        return
      }
      if (mod && event.key.toLowerCase() === "a") {
        event.preventDefault()
        setSelectedIds(page.elements.filter((el) => !el.hidden).map((el) => el.id))
        return
      }
      if (mod && event.key.toLowerCase() === "s") {
        event.preventDefault()
        save()
        return
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedIds.length > 0) {
          event.preventDefault()
          deleteElements(selectedIds)
        }
        return
      }
      if (event.key === "Escape") {
        setSelectedIds([])
        return
      }
      const step = event.shiftKey ? 10 : 1
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        nudgeSelection(-step, 0)
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        nudgeSelection(step, 0)
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        nudgeSelection(0, -step)
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        nudgeSelection(0, step)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  if (!libraryDoc || !page) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">{messages.common.emptyResult}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.studio)}>
          <icons.arrowLeft className="size-4" />
          {messages.studio.editor.backToLibrary}
        </Button>
      </div>
    )
  }

  const mutateDoc = (fn: (draft: DocDocument) => DocDocument) => {
    history.replace(fn(presentRef.current))
    scheduleSave()
  }

  const updateCurrentPage = (patchElements: (elements: DocElement[]) => DocElement[]) => {
    mutateDoc((draft) => ({
      ...draft,
      pages: draft.pages.map((p, index) =>
        index === pageIndex ? { ...p, elements: patchElements(p.elements) } : p
      ),
    }))
  }

  const currentElements = page.elements
  const selectedElements = currentElements.filter((el) => selectedIds.includes(el.id))

  const addElement = (type: string, x: number, y: number) => {
    const el = createElement(type, x, y, 0, 0)
    history.begin()
    updateCurrentPage((elements) => [...elements, el])
    setSelectedIds([el.id])
  }

  const addComponent = (component: MyComponent) => {
    history.begin()
    updateCurrentPage((elements) => [
      ...elements,
      ...component.elements.map((el) =>
        cloneElement(el, 12 + Math.round((elements.length % 4) * 8))
      ),
    ])
  }

  const deleteElements = (ids: string[]) => {
    if (ids.length === 0) return
    history.begin()
    updateCurrentPage((elements) => elements.filter((el) => !ids.includes(el.id)))
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
  }

  const duplicateElement = (elementId: string) => {
    const source = currentElements.find((el) => el.id === elementId)
    if (!source) return
    history.begin()
    const copy = cloneElement(source)
    updateCurrentPage((elements) => [...elements, copy])
    setSelectedIds([copy.id])
  }

  const duplicateSelection = () => {
    if (selectedElements.length === 0) return
    history.begin()
    const copies = selectedElements.map((el) => cloneElement(el))
    updateCurrentPage((elements) => [...elements, ...copies])
    setSelectedIds(copies.map((el) => el.id))
  }

  const toggleLocked = (elementId: string) => {
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) => (el.id === elementId ? { ...el, locked: !el.locked } : el))
    )
  }

  const toggleHidden = (elementId: string) => {
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) => (el.id === elementId ? { ...el, hidden: !el.hidden } : el))
    )
  }

  const reorderElement = (elementId: string, direction: "front" | "forward" | "backward" | "back") => {
    history.begin()
    updateCurrentPage((elements) => {
      const index = elements.findIndex((el) => el.id === elementId)
      if (index === -1) return elements
      const next = [...elements]
      const [item] = next.splice(index, 1)
      if (direction === "front") next.push(item)
      else if (direction === "back") next.unshift(item)
      else if (direction === "forward") next.splice(Math.min(index + 1, next.length), 0, item)
      else next.splice(Math.max(index - 1, 0), 0, item)
      return next
    })
  }

  const renameElement = (elementId: string, name: string) => {
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) => (el.id === elementId ? { ...el, name } : el))
    )
  }

  const updateElementProps = (elementId: string, patch: Record<string, unknown>) => {
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) =>
        el.id === elementId ? { ...el, props: { ...el.props, ...patch } } : el
      )
    )
  }

  const updateTransform = (elementId: string, patch: Partial<DocElement>) => {
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el))
    )
  }

  const updateMultiTransform = (ids: string[], patch: Partial<DocElement>) => {
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) => (ids.includes(el.id) ? { ...el, ...patch } : el))
    )
  }

  const alignSelection = (align: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (selectedElements.length < 2) return
    const minX = Math.min(...selectedElements.map((el) => el.x))
    const maxX = Math.max(...selectedElements.map((el) => el.x + el.width))
    const minY = Math.min(...selectedElements.map((el) => el.y))
    const maxY = Math.max(...selectedElements.map((el) => el.y + el.height))
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) => {
        if (!selectedIds.includes(el.id)) return el
        if (align === "left") return { ...el, x: minX }
        if (align === "center") return { ...el, x: centerX - el.width / 2 }
        if (align === "right") return { ...el, x: maxX - el.width }
        if (align === "top") return { ...el, y: minY }
        if (align === "middle") return { ...el, y: centerY - el.height / 2 }
        return { ...el, y: maxY - el.height }
      })
    )
  }

  const distributeSelection = (axis: "h" | "v") => {
    if (selectedElements.length < 3) return
    const sorted = [...selectedElements].sort((a, b) => (axis === "h" ? a.x - b.x : a.y - b.y))
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const totalSize = axis === "h" ? last.x - first.x : last.y - first.y
    const inner = sorted.slice(1, -1)
    const step = totalSize / (sorted.length - 1)
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) => {
        const index = inner.findIndex((item) => item.id === el.id)
        if (index === -1) return el
        return axis === "h"
          ? { ...el, x: first.x + step * (index + 1) }
          : { ...el, y: first.y + step * (index + 1) }
      })
    )
  }

  const updateDoc = (patch: Partial<DocDocument>) => {
    history.begin()
    mutateDoc((draft) => ({ ...draft, ...patch }))
  }

  const updatePage = (patch: Partial<DocPage>) => {
    history.begin()
    mutateDoc((draft) => ({
      ...draft,
      pages: draft.pages.map((p, index) => (index === pageIndex ? { ...p, ...patch } : p)),
    }))
  }

  const applyThemePreset = (presetId: string) => {
    const theme = themePresetById(presetId)
    if (!theme) return
    history.begin()
    mutateDoc((draft) => ({ ...draft, theme }))
  }

  const addPage = () => {
    history.begin()
    mutateDoc((draft) => ({
      ...draft,
      pages: [
        ...draft.pages,
        createPage(draft.pages[0].sizeId, draft.pages[0].orientation, messages.studio.editor.pageLabel(draft.pages.length + 1)),
      ],
    }))
    setPageIndex(doc.pages.length)
    setSelectedIds([])
  }

  const duplicatePage = () => {
    history.begin()
    const source = page
    const copy: DocPage = {
      ...source,
      id: uid(),
      name: `${source.name} ${messages.studio.editor.pageCopySuffix}`,
      elements: source.elements.map((el) => cloneElement(el, 0)),
    }
    mutateDoc((draft) => ({
      ...draft,
      pages: [...draft.pages, copy],
    }))
    setPageIndex(doc.pages.length)
    setSelectedIds([])
  }

  const deletePage = () => {
    if (doc.pages.length <= 1) return
    history.begin()
    mutateDoc((draft) => ({
      ...draft,
      pages: draft.pages.filter((p) => p.id !== page.id),
    }))
    setPageIndex((prev) => Math.max(0, prev - 1))
    setSelectedIds([])
  }

  const saveAsComponent = () => {
    if (selectedElements.length === 0) return
    setComponentOpen(true)
  }

  const confirmSaveComponent = () => {
    const name = componentName.trim()
    if (!name) return
    library.saveComponent(name, selectedElements.map((el) => structuredClone(el)))
    setComponentOpen(false)
    setComponentName("")
    toast(messages.studio.toasts.componentSaved)
  }

  const saveVersion = (note: string) => {
    library.addVersion(id, bumpVersion(doc.version), note, presentRef.current)
    library.updateMeta(id, { version: bumpVersion(doc.version) })
  }

  const restoreVersion = (snapshot: DocDocument) => {
    history.reset(structuredClone(snapshot))
    setPageIndex(0)
    setSelectedIds([])
    library.saveDocument(snapshot)
  }

  const exportPdf = async () => {
    setExporting(true)
    try {
      await exportDocumentToPdf(doc, doc.name)
    } catch {
      toast(messages.studio.toasts.exportFailed)
    } finally {
      setExporting(false)
    }
  }

  const copySelection = () => {
    if (selectedElements.length === 0) return
    clipboardRef.current = selectedElements.map((el) => structuredClone(el))
  }

  const cutSelection = () => {
    copySelection()
    deleteElements(selectedIds)
  }

  const pasteClipboard = () => {
    if (clipboardRef.current.length === 0) return
    history.begin()
    const copies = clipboardRef.current.map((el) => cloneElement(el))
    updateCurrentPage((elements) => [...elements, ...copies])
    setSelectedIds(copies.map((el) => el.id))
  }

  const nudgeSelection = (dx: number, dy: number) => {
    if (selectedIds.length === 0) return
    history.begin()
    updateCurrentPage((elements) =>
      elements.map((el) =>
        selectedIds.includes(el.id)
          ? { ...el, x: el.x + dx, y: el.y + dy }
          : el
      )
    )
  }

  const applyElementPatches = (patches: Record<string, Partial<DocElement>>) => {
    updateCurrentPage((elements) =>
      elements.map((el) => (patches[el.id] ? { ...el, ...patches[el.id] } : el))
    )
  }

  const editor = messages.studio.editor
  const canUndo = history.canUndo
  const canRedo = history.canRedo

  const insertGroups = INSERT_CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_META[category].label,
    icon: CATEGORY_META[category].icon,
    items: Object.values(elementCatalog).filter(
      (definition) => definition.category === category
    ),
  })).filter((group) => group.items.length > 0)

  const panelContent = (
    panel === "palette" ? (
      <PalettePanel
        onAddType={(type) => addElement(type, Math.round(page.width / 2), Math.round(page.height / 2))}
        components={library.components}
        onAddComponent={addComponent}
      />
    ) : (
      <LayersPanel
        elements={currentElements}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
        onToggleHidden={toggleHidden}
        onToggleLocked={toggleLocked}
        onReorder={reorderElement}
        onDuplicate={duplicateElement}
        onDelete={deleteElements}
        onRename={renameElement}
      />
    )
  )

  if (previewMode) {
    return (
      <div className="flex h-[calc(100svh-6.5rem)] flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-card/60 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)}>
              <icons.pencil className="size-4" />
              {editor.edit}
            </Button>
            <DocumentTitle name={doc.name} onRename={renameDocument} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.studio)}>
              <icons.arrowLeft className="size-4" />
              <span className="hidden md:inline">{editor.backToLibrary}</span>
            </Button>
            <Button size="sm" disabled={exporting} onClick={exportPdf}>
              <icons.export className="size-4" />
              {exporting ? editor.exporting : editor.exportPdf}
            </Button>
          </div>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto bg-muted/50 p-8">
          {doc.pages.map((p, index) => (
            <div key={p.id} className="mx-auto w-fit bg-card shadow-xl ring-1 ring-border/60">
              <PageContent doc={doc} page={p} pageIndex={index} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100svh-6.5rem)] flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-0.5 border-b bg-card/60 px-2.5 backdrop-blur">
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => navigate(ROUTES.studio)}>
          <icons.arrowLeft className="size-4" />
          <span className="hidden lg:inline">{editor.backToLibrary}</span>
        </Button>
        <div className="flex min-w-0 items-center gap-1.5">
          <DocumentTitle name={doc.name} onRename={renameDocument} />
          <span
            className={cn(
              "flex items-center gap-1 text-[11px]",
              saveState === "saving" ? "text-muted-foreground" : "text-success"
            )}
          >
            {saveState === "saving" ? (
              <>
                <icons.spinner className="size-3 animate-spin" />
                {editor.saveStatusSaving}
              </>
            ) : (
              <>
                <icons.check className="size-3" />
                {relativeSaved(lastSavedAt)}
              </>
            )}
          </span>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            disabled={!canUndo}
            onClick={() => history.undo()}
            title={editor.undo}
            aria-label={editor.undo}
          >
            <icons.undo className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            disabled={!canRedo}
            onClick={() => history.redo()}
            title={editor.redo}
            aria-label={editor.redo}
          >
            <icons.redo className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={copySelection} title={editor.copy} aria-label={editor.copy}>
            <icons.copy className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={pasteClipboard} title={editor.paste} aria-label={editor.paste}>
            <icons.paste className="size-4" />
          </Button>

          <div className="mx-1 h-5 w-px shrink-0 bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2" title={editor.insert}>
                <icons.plus className="size-4" />
                <span className="hidden xl:inline">{editor.insert}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[28rem] w-56 overflow-y-auto">
              {insertGroups.map((group) => {
                const GroupIcon = icons[group.icon]
                return (
                  <Fragment key={group.category}>
                    <DropdownMenuLabel className="flex items-center gap-1.5">
                      <GroupIcon className="size-3.5" />
                      {group.label}
                    </DropdownMenuLabel>
                    {group.items.map((definition) => {
                      const Icon = icons[definition.icon]
                      return (
                        <DropdownMenuItem
                          key={definition.type}
                          onClick={() =>
                            addElement(
                              definition.type,
                              Math.round(page.width / 2),
                              Math.round(page.height / 2)
                            )
                          }
                        >
                          <Icon className="size-4" />
                          {definition.name}
                        </DropdownMenuItem>
                      )
                    })}
                    <DropdownMenuSeparator />
                  </Fragment>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setVariablesOpen(true)} title={editor.variables} aria-label={editor.variables}>
            <icons.variables className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setVersionsOpen(true)} title={editor.versionHistory} aria-label={editor.versionHistory}>
            <icons.pendingReviews className="size-4" />
          </Button>

          <div className="mx-1 h-5 w-px shrink-0 bg-border" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 lg:hidden"
            onClick={() => setMobileLeftOpen(true)}
            title={editor.openPalette}
            aria-label={editor.openPalette}
          >
            <icons.layers className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 lg:hidden"
            onClick={() => setMobileRightOpen(true)}
            title={editor.openProperties}
            aria-label={editor.openProperties}
          >
            <icons.settings className="size-4" />
          </Button>

          <Button
            variant={previewMode ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setPreviewMode(true)}
            title={editor.preview}
            aria-label={editor.preview}
          >
            <icons.eye className="size-4" />
          </Button>
          <Button size="sm" className="h-8 gap-1.5 px-3" disabled={exporting} onClick={exportPdf}>
            <icons.export className="size-4" />
            <span className="hidden md:inline">{exporting ? editor.exporting : editor.exportPdf}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2" title={editor.more} aria-label={editor.more}>
                <icons.moreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={addPage}>
                <icons.plus className="size-4" />
                {editor.addPage}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={duplicatePage}>
                <icons.duplicate className="size-4" />
                {editor.duplicatePage}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={doc.pages.length <= 1}
                onClick={() => setDeletePageOpen(true)}
                className="text-destructive"
              >
                <icons.trash className="size-4" />
                {editor.deletePage}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={selectedElements.length === 0} onClick={saveAsComponent}>
                <icons.sparkles className="size-4" />
                {editor.saveComponent}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b bg-muted/20 px-3">
        {doc.pages.map((p, index) => (
          <div key={p.id} className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                setPageIndex(index)
                setSelectedIds([])
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                index === pageIndex
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {p.name}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                  title={editor.pages}
                >
                  <icons.chevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={duplicatePage}>
                  <icons.duplicate className="size-4" />
                  {editor.duplicatePage}
                </DropdownMenuItem>
                <DropdownMenuItem disabled={doc.pages.length <= 1} onClick={() => setDeletePageOpen(true)}>
                  <icons.trash className="size-4" />
                  {editor.deletePage}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        <button
          type="button"
          onClick={addPage}
          className="ml-1 flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground hover:border-primary/50 hover:text-primary"
          title={editor.addPage}
          aria-label={editor.addPage}
        >
          <icons.plus className="size-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden min-h-0 w-[220px] shrink-0 border-r bg-card/50 lg:flex">
          <div className="flex h-full flex-col">
            <PanelTabs panel={panel} onChange={setPanel} />
            <div className="min-h-0 flex-1">{panelContent}</div>
          </div>
        </aside>

        <main className="min-h-0 min-w-0 flex-1">
          <CanvasView
            doc={doc}
            pageIndex={safePageIndex}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
            zoom={zoom}
            onZoom={setZoom}
            beginGesture={() => history.begin()}
            applyElementPatches={applyElementPatches}
            addElementsFromType={(type, x, y) => addElement(type, x, y)}
          />
        </main>

        <aside className="hidden min-h-0 w-[280px] shrink-0 border-l bg-card/50 lg:flex">
          <PropertiesPanel
            doc={doc}
            page={page}
            selectedElements={selectedElements}
            onUpdateElementProps={updateElementProps}
            onRenameElement={renameElement}
            onUpdateTransform={updateTransform}
            onUpdateMultiTransform={updateMultiTransform}
            onToggleLocked={toggleLocked}
            onToggleHidden={toggleHidden}
            onReorder={reorderElement}
            onDuplicateElement={duplicateElement}
            onDeleteElements={deleteElements}
            onAlign={alignSelection}
            onDistribute={distributeSelection}
            onUpdateDoc={updateDoc}
            onUpdatePage={updatePage}
            onApplyThemePreset={applyThemePreset}
            onSaveAsComponent={saveAsComponent}
          />
        </aside>
      </div>

      {/* Mobile palette/layers sheet */}
      <Sheet open={mobileLeftOpen} onOpenChange={setMobileLeftOpen}>
        <SheetContent side="left" className="w-full gap-0 sm:max-w-[20rem]">
          <SheetHeader>
            <SheetTitle>{editor.elements}</SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            <PanelTabs panel={panel} onChange={setPanel} />
            <div className="min-h-0 flex-1">{panelContent}</div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile properties sheet */}
      <Sheet open={mobileRightOpen} onOpenChange={setMobileRightOpen}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-[22rem]">
          <SheetHeader>
            <SheetTitle>{editor.properties}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1">
          <PropertiesPanel
            doc={doc}
            page={page}
            selectedElements={selectedElements}
            onUpdateElementProps={updateElementProps}
            onRenameElement={renameElement}
            onUpdateTransform={updateTransform}
            onUpdateMultiTransform={updateMultiTransform}
            onToggleLocked={toggleLocked}
            onToggleHidden={toggleHidden}
            onReorder={reorderElement}
            onDuplicateElement={duplicateElement}
            onDeleteElements={deleteElements}
            onAlign={alignSelection}
            onDistribute={distributeSelection}
            onUpdateDoc={updateDoc}
            onUpdatePage={updatePage}
            onApplyThemePreset={applyThemePreset}
            onSaveAsComponent={saveAsComponent}
          />
        </div>
        </SheetContent>
      </Sheet>

      <VariablesDialog
        open={variablesOpen}
        onOpenChange={setVariablesOpen}
        variables={doc.variables}
        onChange={(variables) => {
          history.begin()
          mutateDoc((draft) => ({ ...draft, variables }))
        }}
      />

      <VersionHistoryDialog
        open={versionsOpen}
        onOpenChange={setVersionsOpen}
        versions={libraryDoc.versions}
        onSaveVersion={saveVersion}
        onRestore={restoreVersion}
      />

      <Dialog open={componentOpen} onOpenChange={setComponentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editor.saveComponentTitle}</DialogTitle>
            <DialogDescription>{editor.saveComponent}</DialogDescription>
          </DialogHeader>
          <Input
            value={componentName}
            onChange={(event) => setComponentName(event.target.value)}
            placeholder={editor.componentName}
            className="h-9"
          />
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setComponentOpen(false)}>
              {messages.common.cancel}
            </Button>
            <Button type="button" size="sm" disabled={!componentName.trim()} onClick={confirmSaveComponent}>
              {editor.saveComponent}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deletePageOpen} onOpenChange={setDeletePageOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editor.deletePage}</DialogTitle>
            <DialogDescription>{editor.deletePageDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setDeletePageOpen(false)}>
              {messages.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                deletePage()
                setDeletePageOpen(false)
              }}
            >
              {messages.studio.library.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
