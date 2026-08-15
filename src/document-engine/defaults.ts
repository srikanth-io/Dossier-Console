import { uid } from "@/document-engine/history"
import { sizedPage } from "@/document-engine/pageSizes"
import { createElement } from "@/document-engine/registry"
import { DEFAULT_THEME } from "@/document-engine/themes"
import type {
  DocDocument,
  DocPage,
  Orientation,
  PageSizeId,
  TemplateCategory,
} from "@/document-engine/types"

export function createPage(
  sizeId: PageSizeId,
  orientation: Orientation,
  name?: string,
  index = 1
): DocPage {
  const size = sizedPage(sizeId, orientation)
  return {
    id: uid(),
    name: name ?? `Page ${index}`,
    sizeId,
    width: size.width,
    height: size.height,
    orientation,
    background: "#ffffff",
    elements: [],
  }
}

export interface CreateDocumentOptions {
  name?: string
  description?: string
  category?: TemplateCategory
  type?: string
  sizeId?: PageSizeId
  orientation?: Orientation
  width?: number
  height?: number
  theme?: DocDocument["theme"]
}

export function createBlankDocument(
  options: CreateDocumentOptions = {}
): DocDocument {
  const sizeId = options.sizeId ?? "a4"
  const orientation = options.orientation ?? "portrait"
  const size =
    sizeId === "custom" && options.width && options.height
      ? { width: options.width, height: options.height }
      : sizedPage(sizeId, orientation)
  const now = new Date().toISOString()
  const page: DocPage = {
    id: uid(),
    name: "Page 1",
    sizeId,
    width: size.width,
    height: size.height,
    orientation,
    background: "#ffffff",
    elements: [],
  }
  return {
    id: uid(),
    name: options.name ?? "Untitled document",
    description: options.description ?? "",
    category: options.category ?? "custom",
    type: options.type ?? "blank",
    status: "draft",
    author: "Admin",
    version: "1.0",
    createdAt: now,
    updatedAt: now,
    mode: "freeform",
    theme: options.theme ?? { ...DEFAULT_THEME },
    variables: [],
    pages: [page],
    grid: 8,
    snapToGrid: true,
  }
}

export function createTitlePageElements(sizeId: PageSizeId, orientation: Orientation) {
  const size = sizedPage(sizeId, orientation)
  const centerX = Math.round(size.width / 2)
  return [
    createElement("heading", centerX - 220, 220, 440, 56, {
      props: { level: "h1", content: "Document title" },
    }),
    createElement("text", centerX - 220, 290, 440, 60, {
      props: {
        content:
          "This is a cover page. Double-click an element to edit it in the Properties panel, or drag components from the left.",
        align: "center",
      },
    }),
    createElement("divider", centerX - 120, 380, 240, 24, {}),
  ]
}

export function createCenteredText(sizeId: PageSizeId, orientation: Orientation) {
  const size = sizedPage(sizeId, orientation)
  const centerX = Math.round(size.width / 2)
  return [
    createElement("heading", centerX - 200, 120, 400, 48, {
      props: { level: "h2", content: "Section title", align: "center" },
    }),
    createElement("text", centerX - 200, 180, 400, 120, {
      props: { content: "Add your content here.", align: "center" },
    }),
  ]
}
