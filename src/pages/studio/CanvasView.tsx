import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react"

import { cn } from "@/lib/utils"
import { PageContent } from "@/document-engine/PageContent"
import { definitionFor } from "@/document-engine/registry"
import type { DocDocument, DocElement, EditTarget } from "@/document-engine/types"
import { icons, messages } from "@/constants"

type Gesture =
  | { kind: "none" }
  | { kind: "move"; ids: string[]; startPoint: { x: number; y: number }; start: { x: number; y: number }[]; moved: boolean }
  | {
      kind: "resize"
      id: string
      handle: { left: boolean; right: boolean; top: boolean; bottom: boolean }
      startX: number
      startY: number
      startW: number
      startH: number
      startPoint: { x: number; y: number }
    }
  | { kind: "rotate"; id: string; cx: number; cy: number; startRotation: number; startPoint: { x: number; y: number } }

const MIN_SIZE = 8
const HANDLE = 9

function snapValue(value: number, grid: number, snap: boolean): number {
  return snap ? Math.round(value / grid) * grid : value
}

function elementPosition(el: DocElement) {
  return { x: el.x, y: el.y, width: el.width, height: el.height, rotation: el.rotation }
}

function str(props: Record<string, unknown>, key: string, fallback = ""): string {
  return typeof props[key] === "string" ? (props[key] as string) : fallback
}

function num(props: Record<string, unknown>, key: string, fallback = 0): number {
  return typeof props[key] === "number" ? (props[key] as number) : fallback
}

function inlineTextField(el: DocElement): { field: string; multiLine: boolean } | null {
  const def = definitionFor(el.type)
  if (!def) return null
  for (const group of def.schema) {
    for (const field of group) {
      if (field.kind === "text" || field.kind === "textarea") {
        if (def.textProp && field.key !== def.textProp) continue
        return { field: field.key, multiLine: field.kind === "textarea" }
      }
    }
  }
  return null
}

function fieldLabelFor(el: DocElement, key: string): string {
  const def = definitionFor(el.type)
  if (!def) return key
  for (const group of def.schema) {
    for (const field of group) {
      if (field.key === key) return field.label
    }
  }
  return key
}

function inlineEditTarget(el: DocElement, event: ReactMouseEvent): EditTarget | null {
  if (el.type === "table" || el.type === "testCaseTable") {
    const td = (event.target as HTMLElement).closest?.("td") as HTMLElement | null
    if (!td) return null
    const row = Number(td.dataset.row)
    const col = Number(td.dataset.col)
    if (Number.isNaN(row) || Number.isNaN(col)) return null
    return { kind: "cell", elementId: el.id, row, col }
  }
  if (el.type === "chart") {
    return { kind: "field", elementId: el.id, field: "data", multiLine: true }
  }
  const field = inlineTextField(el)
  if (!field) return null
  return { kind: "field", elementId: el.id, field: field.field, multiLine: field.multiLine }
}

function inlineTextStyle(el: DocElement): CSSProperties {
  const props = el.props
  const level = str(props, "level", "h1")
  const headingSizes: Record<string, number> = { h1: 32, h2: 24, h3: 20 }
  const heading = el.type === "heading"
  const fontSize = num(props, "fontSize") || (heading ? headingSizes[level] || 24 : 14)
  return {
    fontFamily: str(props, "fontFamily") || undefined,
    fontSize,
    fontWeight: str(props, "fontWeight") || (heading ? "700" : "400"),
    color: str(props, "color") || undefined,
    textAlign: (str(props, "align", "left") || "left") as CSSProperties["textAlign"],
    lineHeight: num(props, "lineHeight") || (heading ? 1.2 : 1.6),
    letterSpacing: num(props, "letterSpacing", 0),
    padding: num(props, "padding", 0),
    textTransform: (str(props, "textTransform", "none") || "none") as CSSProperties["textTransform"],
  }
}

export interface CanvasViewProps {
  doc: DocDocument
  pageIndex: number
  selectedIds: string[]
  onSelect: (ids: string[]) => void
  zoom: number
  onZoom: (zoom: number) => void
  beginGesture: () => void
  applyElementPatches: (patches: Record<string, Partial<DocElement>>) => void
  addElementsFromType: (type: string, x: number, y: number) => void
}

export function CanvasView({
  doc,
  pageIndex,
  selectedIds,
  onSelect,
  zoom,
  onZoom,
  beginGesture,
  applyElementPatches,
  addElementsFromType,
}: CanvasViewProps) {
  const page = doc.pages[pageIndex]
  const pageRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const gestureRef = useRef<Gesture>({ kind: "none" })
  const [draggingOver, setDraggingOver] = useState(false)
  const [, force] = useState(0)

  const rerender = useCallback(() => force((n) => n + 1), [])

  const toPageCoords = useCallback(
    (clientX: number, clientY: number) => {
      const rect = pageRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }
      return {
        x: (clientX - rect.left) / zoom,
        y: (clientY - rect.top) / zoom,
      }
    },
    [zoom]
  )

  const endGesture = useCallback(() => {
    gestureRef.current = { kind: "none" }
    rerender()
  }, [rerender])

  useEffect(() => {
    if (pageIndex >= doc.pages.length) return
    onSelect([])
    setEditing(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex])

  useEffect(() => () => endGesture(), [endGesture])

  const [editing, setEditing] = useState<EditTarget | null>(null)

  const commitEdit = (value: string) => {
    if (!editing) return
    const el = page.elements.find((item) => item.id === editing.elementId)
    if (!el) return
    if (editing.kind === "field") {
      applyElementPatches({
        [el.id]: { props: { ...el.props, [editing.field]: value } },
      })
    } else {
      const rows = Array.isArray(el.props.rows)
        ? (el.props.rows as string[][]).map((row) => [...row])
        : []
      if (!rows[editing.row]) rows[editing.row] = []
      rows[editing.row][editing.col] = value
      applyElementPatches({ [el.id]: { props: { ...el.props, rows } } })
    }
  }

  const handleElementDoubleClick = (el: DocElement, event: ReactMouseEvent) => {
    if (el.locked) return
    const target = inlineEditTarget(el, event)
    if (!target) return
    onSelect([el.id])
    beginGesture()
    setEditing(target)
  }

  const handleElementPointerDown = (el: DocElement, event: ReactPointerEvent) => {
    if (editing && editing.elementId === el.id) return
    event.stopPropagation()
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      onSelect(
        selectedIds.includes(el.id)
          ? selectedIds.filter((id) => id !== el.id)
          : [...selectedIds, el.id]
      )
      return
    }
    if (!selectedIds.includes(el.id)) onSelect([el.id])
    beginMove(el, event)
  }

  const beginMove = (el: DocElement, event: ReactPointerEvent) => {
    if (el.locked) return
    if (doc.mode !== "freeform") return
    beginGesture()
    const ids = selectedIds.includes(el.id) ? selectedIds : [el.id]
    const start = ids
      .map((id) => page.elements.find((item) => item.id === id))
      .filter((item): item is DocElement => Boolean(item))
      .map(elementPosition)
    gestureRef.current = {
      kind: "move",
      ids,
      startPoint: toPageCoords(event.clientX, event.clientY),
      start,
      moved: false,
    }
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp, { once: true })
    rerender()
  }

  const beginResize = (
    el: DocElement,
    handle: { left: boolean; right: boolean; top: boolean; bottom: boolean },
    event: ReactPointerEvent
  ) => {
    event.stopPropagation()
    if (el.locked) return
    if (doc.mode !== "freeform") return
    beginGesture()
    gestureRef.current = {
      kind: "resize",
      id: el.id,
      handle,
      startX: el.x,
      startY: el.y,
      startW: el.width,
      startH: el.height,
      startPoint: toPageCoords(event.clientX, event.clientY),
    }
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp, { once: true })
    rerender()
  }

  const beginRotate = (el: DocElement, event: ReactPointerEvent) => {
    event.stopPropagation()
    if (el.locked) return
    if (doc.mode !== "freeform") return
    beginGesture()
    gestureRef.current = {
      kind: "rotate",
      id: el.id,
      cx: el.x + el.width / 2,
      cy: el.y + el.height / 2,
      startRotation: el.rotation,
      startPoint: toPageCoords(event.clientX, event.clientY),
    }
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp, { once: true })
    rerender()
  }

  const handlePointerMove = (event: PointerEvent) => {
    const gesture = gestureRef.current
    if (gesture.kind === "none") return
    const point = toPageCoords(event.clientX, event.clientY)

    if (gesture.kind === "move") {
      const dx = point.x - gesture.startPoint.x
      const dy = point.y - gesture.startPoint.y
      if (!gesture.moved && Math.abs(dx) + Math.abs(dy) < 2) return
      gesture.moved = true
      const patches: Record<string, Partial<DocElement>> = {}
      gesture.ids.forEach((id, index) => {
        const start = gesture.start[index]
        if (!start) return
        patches[id] = {
          x: snapValue(start.x + dx, doc.grid, doc.snapToGrid),
          y: snapValue(start.y + dy, doc.grid, doc.snapToGrid),
        }
      })
      applyElementPatches(patches)
    }

    if (gesture.kind === "resize") {
      const dx = point.x - gesture.startPoint.x
      const dy = point.y - gesture.startPoint.y
      const { handle, startX, startY, startW, startH } = gesture
      let newX = startX
      let newY = startY
      let newW = startW
      let newH = startH
      if (handle.right) newW = Math.max(MIN_SIZE, startW + dx)
      if (handle.left) {
        newW = Math.max(MIN_SIZE, startW - dx)
        newX = startX + (startW - newW)
      }
      if (handle.bottom) newH = Math.max(MIN_SIZE, startH + dy)
      if (handle.top) {
        newH = Math.max(MIN_SIZE, startH - dy)
        newY = startY + (startH - newH)
      }
      applyElementPatches({
        [gesture.id]: {
          x: snapValue(newX, doc.grid, doc.snapToGrid),
          y: snapValue(newY, doc.grid, doc.snapToGrid),
          width: snapValue(newW, doc.grid, doc.snapToGrid),
          height: snapValue(newH, doc.grid, doc.snapToGrid),
        },
      })
    }

    if (gesture.kind === "rotate") {
      const angle =
        (Math.atan2(point.y - gesture.cy, point.x - gesture.cx) * 180) / Math.PI +
        90
      applyElementPatches({
        [gesture.id]: { rotation: Math.round(angle) },
      })
    }
  }

  const handlePointerUp = () => {
    window.removeEventListener("pointermove", handlePointerMove)
    endGesture()
  }

  const overlay = (el: DocElement) => {
    const editingField =
      editing && editing.kind === "field" && editing.elementId === el.id && el.type !== "chart"
        ? editing
        : null
    const editBox = editingField ? (
      <>
        <textarea
          value={String(el.props[editingField.field] ?? "")}
          autoFocus
          onFocus={(event) => event.target.select()}
          onChange={(event) => commitEdit(event.target.value)}
          onBlur={() => setEditing(null)}
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Escape") {
              event.preventDefault()
              setEditing(null)
            } else if (event.key === "Enter" && !editingField.multiLine) {
              event.preventDefault()
              setEditing(null)
            }
          }}
          className="absolute inset-0 z-30 resize-none overflow-hidden rounded-[inherit] bg-background/95 p-2 pt-6 text-foreground outline-none ring-2 ring-primary"
          style={inlineTextStyle(el)}
        />
        <span className="pointer-events-none absolute top-1 left-1 z-40 max-w-[calc(100%-8px)] truncate rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          Editing {fieldLabelFor(el, editingField.field)}
        </span>
      </>
    ) : null
    if (doc.mode !== "freeform") {
      return (
        <>
          {editBox}
          {selectedIds.includes(el.id) ? (
            <div className="pointer-events-none absolute inset-0 border-2 border-primary/80" />
          ) : null}
        </>
      )
    }
    if (!selectedIds.includes(el.id)) {
      return editBox
    }
      const single = selectedIds.length === 1 && selectedIds[0] === el.id
      const handles = [
        { dir: "nw", left: true, top: true, style: { left: 0, top: 0, cursor: "nwse-resize" } },
        { dir: "n", left: false, top: true, style: { left: "50%", top: 0, cursor: "ns-resize" } },
        { dir: "ne", left: false, top: true, style: { right: 0, top: 0, cursor: "nesw-resize" } },
        { dir: "e", left: false, top: false, style: { right: 0, top: "50%", cursor: "ew-resize" } },
        { dir: "se", left: false, top: false, style: { right: 0, bottom: 0, cursor: "nwse-resize" } },
        { dir: "s", left: false, top: false, style: { left: "50%", bottom: 0, cursor: "ns-resize" } },
        { dir: "sw", left: true, top: false, style: { left: 0, bottom: 0, cursor: "nesw-resize" } },
        { dir: "w", left: true, top: false, style: { left: 0, top: "50%", cursor: "ew-resize" } },
      ]
      const left = (v: number) => ({ left: `calc(${v}% - ${HANDLE / 2}px)` })
      const top = (v: number) => ({ top: `calc(${v}% - ${HANDLE / 2}px)` })
      const right = (v: number) => ({ right: `calc(${100 - v}% - ${HANDLE / 2}px)` })
      const bottom = (v: number) => ({ bottom: `calc(${100 - v}% - ${HANDLE / 2}px)` })
      const positionMap = {
        nw: { ...left(0), ...top(0), cursor: "nwse-resize" },
        n: { ...left(50), ...top(0), cursor: "ns-resize" },
        ne: { ...right(0), ...top(0), cursor: "nesw-resize" },
        e: { ...right(0), ...top(50), cursor: "ew-resize" },
        se: { ...right(0), ...bottom(0), cursor: "nwse-resize" },
        s: { ...left(50), ...bottom(0), cursor: "ns-resize" },
        sw: { ...left(0), ...bottom(0), cursor: "nesw-resize" },
        w: { ...left(0), ...top(50), cursor: "ew-resize" },
      }
      const handleFlags: Record<string, { left: boolean; right: boolean; top: boolean; bottom: boolean }> = {
        nw: { left: true, right: false, top: true, bottom: false },
        n: { left: false, right: false, top: true, bottom: false },
        ne: { left: false, right: true, top: true, bottom: false },
        e: { left: false, right: true, top: false, bottom: false },
        se: { left: false, right: true, top: false, bottom: true },
        s: { left: false, right: false, top: false, bottom: true },
        sw: { left: true, right: false, top: false, bottom: true },
        w: { left: true, right: false, top: false, bottom: false },
      }
      return (
        <>
          {editBox}
          <div className="pointer-events-none absolute inset-0 border-2 border-primary/80 bg-primary/5" />
          {single && (
            <>
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2"
                style={{ cursor: "grab" }}
              >
                <div
                  onPointerDown={(e) => beginRotate(el, e)}
                  className="flex size-6 -rotate-45 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
                >
                  <icons.rotate className="size-3.5" />
                </div>
              </div>
              {handles.map((handle) => (
                <div
                  key={handle.dir}
                  className="absolute z-20 border border-primary bg-white shadow-sm"
                  style={{
                    width: HANDLE,
                    height: HANDLE,
                    borderRadius: 2,
                    ...positionMap[handle.dir as keyof typeof positionMap],
                  }}
                  onPointerDown={(e) => beginResize(el, handleFlags[handle.dir], e)}
                />
              ))}
            </>
          )}
        </>
      )
    }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    if (!draggingOver) setDraggingOver(true)
  }

  const handleDragLeave = () => setDraggingOver(false)

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDraggingOver(false)
    const type = event.dataTransfer.getData("application/x-doc-element")
    if (!type) return
    const point = toPageCoords(event.clientX, event.clientY)
    addElementsFromType(type, Math.round(point.x), Math.round(point.y))
  }

  const zoomFit = useCallback(() => {
    const scroll = scrollRef.current
    if (!scroll) return
    const available = { width: scroll.clientWidth - 96, height: scroll.clientHeight - 96 }
    const fit = Math.min(available.width / page.width, available.height / page.height, 1.5)
    onZoom(Math.max(0.2, Math.round(fit * 20) / 20))
  }, [page, onZoom])

  useEffect(() => {
    const scroll = scrollRef.current
    if (!scroll) return
    const fit = (scroll.clientWidth - 48) / page.width
    onZoom(Math.min(2, Math.max(0.2, Math.round(fit * 20) / 20)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.width])

  const emptyPage = page.elements.length === 0

  const selectionBox = useMemo(() => {
    if (selectedIds.length === 0) return null
    const selected = page.elements.filter((el) => selectedIds.includes(el.id))
    if (selected.length === 0) return null
    const minX = Math.min(...selected.map((el) => el.x))
    const minY = Math.min(...selected.map((el) => el.y))
    const maxX = Math.max(...selected.map((el) => el.x + el.width))
    const maxY = Math.max(...selected.map((el) => el.y + el.height))
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }, [selectedIds, page.elements])

  if (!page) return null

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        className="h-full overflow-auto bg-muted/50"
        onPointerDown={() => {
          if (gestureRef.current.kind === "none") onSelect([])
        }}
      >
        <div className="flex min-h-full w-max items-start justify-center px-10 py-8">
        <div
          className="relative shrink-0"
          style={{ width: page.width * zoom, height: page.height * zoom }}
        >
          <div
            className="absolute inset-0"
            style={{
              width: page.width,
              height: page.height,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <div
              ref={pageRef}
              className={cn(
                "relative",
                draggingOver && "ring-2 ring-primary ring-offset-4"
              )}
              style={{ width: page.width, height: page.height, touchAction: "none" }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <PageContent
                doc={doc}
                page={page}
                pageIndex={pageIndex}
                editMode
                interactive
                onElementPointerDown={handleElementPointerDown}
                onElementDoubleClick={handleElementDoubleClick}
                onPagePointerDown={(e) => {
                  if (e.target === e.currentTarget) onSelect([])
                }}
                editSession={
                  editing
                    ? { target: editing, commit: commitEdit, cancel: () => setEditing(null) }
                    : undefined
                }
                overlay={overlay}
              />
              {selectionBox && (
                <div
                  className="pointer-events-none absolute border border-primary/50"
                  style={{
                    left: selectionBox.x,
                    top: selectionBox.y,
                    width: selectionBox.width,
                    height: selectionBox.height,
                  }}
                />
              )}
            </div>
          </div>

          {emptyPage && zoom > 0.4 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg bg-background/90 px-4 py-3 text-center shadow-sm ring-1 ring-border">
                <p className="text-sm font-medium text-foreground">
                  {messages.studio.editor.emptyPage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      <div className="absolute right-3 bottom-3 z-40 flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md hover:bg-muted"
          onClick={() => onZoom(Math.max(0.2, Math.round((zoom - 0.1) * 10) / 10))}
          title={messages.studio.editor.zoomOut}
        >
          <icons.zoomOut className="size-4" />
        </button>
        <button
          type="button"
          className="min-w-14 rounded-md px-2 py-0.5 text-xs font-medium hover:bg-muted"
          onClick={zoomFit}
          title={messages.studio.editor.zoomFit}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md hover:bg-muted"
          onClick={() => onZoom(Math.min(2, Math.round((zoom + 0.1) * 10) / 10))}
          title={messages.studio.editor.zoomIn}
        >
          <icons.zoomIn className="size-4" />
        </button>
      </div>

      {selectedIds.length === 0 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm ring-1 ring-border">
          {messages.studio.editor.selectHint}
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm ring-1 ring-border">
        {page.name}
      </div>
    </div>
  )
}
