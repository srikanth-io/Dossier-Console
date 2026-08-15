import type { CSSProperties, PointerEvent, ReactNode } from "react"

import { renderElement } from "@/document-engine/renderers"
import type { DocDocument, DocElement, DocPage } from "@/document-engine/types"
import { variableMap } from "@/document-engine/variables"
import { cn } from "@/lib/utils"

export interface PageContentProps {
  doc: DocDocument
  page: DocPage
  pageIndex: number
  editMode?: boolean
  interactive?: boolean
  onElementPointerDown?: (el: DocElement, event: PointerEvent) => void
  onPagePointerDown?: (event: PointerEvent) => void
  overlay?: (el: DocElement) => ReactNode
  className?: string
  style?: CSSProperties
}

export function PageContent({
  doc,
  page,
  pageIndex,
  editMode = false,
  interactive = false,
  onElementPointerDown,
  onPagePointerDown,
  overlay,
  className,
  style,
}: PageContentProps) {
  const freeform = doc.mode === "freeform"
  const ctx = {
    theme: doc.theme,
    variables: variableMap(doc.variables),
    mode: doc.mode,
    pageIndex,
    totalPages: doc.pages.length,
  }

  const pageStyle: CSSProperties = {
    position: "relative",
    width: page.width,
    height: page.height,
    backgroundColor: page.background || doc.theme.background,
    overflow: "hidden",
    ...style,
  }

  const renderElementNode = (el: DocElement) => (
    <div
      key={el.id}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {renderElement(el, ctx)}
      {overlay?.(el)}
    </div>
  )

  if (!freeform) {
    return (
      <div
        className={cn("doc-page", className)}
        style={{
          ...pageStyle,
          padding: doc.theme.pageMargin,
          display: "flex",
          flexDirection: "column",
          gap: doc.theme.componentSpacing,
        }}
      >
        {page.elements.map((el) => {
          const hidden = el.hidden
          if (hidden && !editMode) return null
          return (
            <div
              key={el.id}
              style={{
                position: "relative",
                width: "100%",
                opacity: hidden && editMode ? 0.25 : el.opacity,
              }}
              onPointerDown={
                editMode && interactive
                  ? (event) => onElementPointerDown?.(el, event)
                  : undefined
              }
            >
              {renderElementNode(el)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn("doc-page", className)}
      style={pageStyle}
      onPointerDown={
        editMode && interactive ? onPagePointerDown : undefined
      }
    >
      {page.elements.map((el, index) => {
        const hidden = el.hidden
        if (hidden && !editMode) return null
        const elementStyle: CSSProperties = {
          position: "absolute",
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          transformOrigin: "center center",
          opacity: hidden && editMode ? 0.25 : el.opacity,
          zIndex: index + 1,
        }
        return (
          <div
            key={el.id}
            style={elementStyle}
            onPointerDown={
              editMode && interactive
                ? (event) => onElementPointerDown?.(el, event)
                : undefined
            }
          >
            {renderElementNode(el)}
          </div>
        )
      })}
    </div>
  )
}
