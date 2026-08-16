export type ElementCategory =
  | "basic"
  | "layout"
  | "document"
  | "data"
  | "content"
  | "security"
  | "education"

export type Orientation = "portrait" | "landscape"
export type PageSizeId = "a4" | "a3" | "a5" | "letter" | "legal" | "custom"
export type DocumentMode = "freeform" | "flow"
export type DocumentStatus = "draft" | "published" | "archived"

export type TemplateCategory =
  | "all"
  | "resume"
  | "reports"
  | "study"
  | "vapt"
  | "business"
  | "education"
  | "certificates"
  | "invoices"
  | "proposals"
  | "custom"

export interface DocTheme {
  headingFont: string
  bodyFont: string
  codeFont: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  border: string
  pageMargin: number
  sectionSpacing: number
  paragraphSpacing: number
  componentSpacing: number
  companyName: string
  footerText: string
}

export interface DocElement {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  locked: boolean
  hidden: boolean
  props: Record<string, unknown>
}

export interface DocPage {
  id: string
  name: string
  sizeId: PageSizeId
  width: number
  height: number
  orientation: Orientation
  background: string
  elements: DocElement[]
}

export interface DocVariable {
  name: string
  value: string
}

export interface DocDocument {
  id: string
  name: string
  description: string
  category: TemplateCategory
  type: string
  status: DocumentStatus
  author: string
  version: string
  createdAt: string
  updatedAt: string
  mode: DocumentMode
  theme: DocTheme
  variables: DocVariable[]
  pages: DocPage[]
  grid: number
  snapToGrid: boolean
}

export interface VersionSnapshot {
  id: string
  version: string
  note: string
  savedAt: string
  snapshot: DocDocument
}

export interface LibraryDocument extends DocDocument {
  versions: VersionSnapshot[]
}

export interface RenderContext {
  theme: DocTheme
  variables: Record<string, string>
  mode: DocumentMode
  pageIndex: number
  totalPages: number
  editSession?: EditSession
}

export type EditTarget =
  | { kind: "field"; elementId: string; field: string; multiLine: boolean }
  | { kind: "cell"; elementId: string; row: number; col: number }

export interface EditSession {
  target: EditTarget
  commit: (value: string) => void
  cancel: () => void
}

export interface MyComponent {
  id: string
  name: string
  createdAt: string
  elements: DocElement[]
}
