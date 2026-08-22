import { messages } from "@/constants"
import type { IconName } from "@/constants/icons"
import type { DocElement, ElementCategory } from "@/document-engine/types"
import { uid } from "@/document-engine/history"

export type PropField =
  | { kind: "text"; key: string; label: string }
  | { kind: "textarea"; key: string; label: string; rows?: number }
  | { kind: "number"; key: string; label: string; min?: number; max?: number; step?: number }
  | { kind: "color"; key: string; label: string }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | { kind: "toggle"; key: string; label: string }
  | { kind: "slider"; key: string; label: string; min: number; max: number; step: number }
  | { kind: "font"; key: string; label: string }
  | { kind: "image"; key: string; label: string }

export interface ElementDefinition {
  type: string
  name: string
  description: string
  category: ElementCategory
  icon: IconName
  defaultSize: { width: number; height: number }
  defaults: Record<string, unknown>
  schema: PropField[][]
  textProp?: string
}

const c = messages.studio.components

function options(
  map: Record<string, string>
): { value: string; label: string }[] {
  return Object.entries(map).map(([value, label]) => ({ value, label }))
}

const weightOptions = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
]

export const elementCatalog: Record<string, ElementDefinition> = {
  text: {
    type: "text",
    name: c.types.text.name,
    description: c.types.text.description,
    category: "basic",
    icon: "text",
    defaultSize: { width: 320, height: 48 },
    defaults: {
      content: "Start writing your document here. Use {{variable_name}} to insert dynamic values.",
      variant: "paragraph",
      fontFamily: "",
      fontSize: 14,
      fontWeight: "400",
      italic: false,
      underline: false,
      color: "",
      background: "",
      align: "left",
      lineHeight: 1.6,
      letterSpacing: 0,
      padding: 0,
      radius: 0,
    },
    textProp: "content",
    schema: [
      [
        { kind: "textarea", key: "content", label: c.fields.content, rows: 4 },
        { kind: "select", key: "variant", label: c.fields.variant, options: options(c.textVariants) },
        { kind: "select", key: "align", label: c.fields.align, options: options(c.alignOptions) },
      ],
      [
        { kind: "font", key: "fontFamily", label: c.fields.fontFamily },
        { kind: "number", key: "fontSize", label: c.fields.fontSize, min: 6, max: 200 },
        { kind: "select", key: "fontWeight", label: c.fields.fontWeight, options: weightOptions },
        { kind: "toggle", key: "italic", label: c.fields.italic },
        { kind: "toggle", key: "underline", label: c.fields.underline },
        { kind: "slider", key: "lineHeight", label: c.fields.lineHeight, min: 1, max: 2.5, step: 0.05 },
        { kind: "slider", key: "letterSpacing", label: c.fields.letterSpacing, min: -1, max: 4, step: 0.1 },
      ],
      [
        { kind: "color", key: "color", label: c.fields.color },
        { kind: "color", key: "background", label: c.fields.background },
        { kind: "number", key: "padding", label: c.fields.padding, min: 0, max: 80 },
        { kind: "number", key: "radius", label: c.fields.radius, min: 0, max: 60 },
      ],
    ],
  },
  heading: {
    type: "heading",
    name: c.types.heading.name,
    description: c.types.heading.description,
    category: "basic",
    icon: "heading",
    defaultSize: { width: 420, height: 48 },
    defaults: {
      level: "h1",
      content: "Document title",
      fontFamily: "",
      fontSize: 0,
      fontWeight: "700",
      color: "",
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: "none",
    },
    textProp: "content",
    schema: [
      [
        { kind: "select", key: "level", label: c.fields.level, options: options(c.headingLevels) },
        { kind: "textarea", key: "content", label: c.fields.content, rows: 2 },
        { kind: "select", key: "align", label: c.fields.align, options: options(c.alignOptions) },
      ],
      [
        { kind: "font", key: "fontFamily", label: c.fields.fontFamily },
        { kind: "number", key: "fontSize", label: c.fields.fontSize, min: 8, max: 200 },
        { kind: "select", key: "fontWeight", label: c.fields.fontWeight, options: weightOptions },
        { kind: "color", key: "color", label: c.fields.color },
        { kind: "slider", key: "letterSpacing", label: c.fields.letterSpacing, min: -1, max: 4, step: 0.1 },
        { kind: "slider", key: "lineHeight", label: c.fields.lineHeight, min: 0.8, max: 2, step: 0.05 },
        { kind: "select", key: "textTransform", label: c.fields.textTransform, options: options(c.transformOptions) },
      ],
    ],
  },
  image: {
    type: "image",
    name: c.types.image.name,
    description: c.types.image.description,
    category: "basic",
    icon: "image",
    defaultSize: { width: 240, height: 160 },
    defaults: {
      src: "",
      fit: "cover",
      radius: 0,
      borderWidth: 0,
      borderColor: "",
      bg: "#e5e7eb",
      caption: "",
    },
    schema: [
      [{ kind: "image", key: "src", label: c.fields.source }],
      [
        { kind: "select", key: "fit", label: c.fields.fit, options: options(c.fitOptions) },
        { kind: "number", key: "radius", label: c.fields.radius, min: 0, max: 100 },
        { kind: "number", key: "borderWidth", label: c.fields.borderWidth, min: 0, max: 20 },
        { kind: "color", key: "borderColor", label: c.fields.borderColor },
        { kind: "color", key: "bg", label: c.fields.background },
        { kind: "text", key: "caption", label: c.fields.caption },
      ],
    ],
  },
  shape: {
    type: "shape",
    name: c.types.shape.name,
    description: c.types.shape.description,
    category: "basic",
    icon: "shape",
    defaultSize: { width: 160, height: 120 },
    defaults: {
      shape: "rect",
      fill: "#e5e7eb",
      fillOpacity: 1,
      stroke: "#495464",
      strokeWidth: 1,
      radius: 8,
    },
    schema: [
      [{ kind: "select", key: "shape", label: c.fields.kind, options: options(c.shapes) }],
      [
        { kind: "color", key: "fill", label: c.fields.fill },
        { kind: "slider", key: "fillOpacity", label: c.fields.fillOpacity, min: 0, max: 1, step: 0.05 },
        { kind: "color", key: "stroke", label: c.fields.stroke },
        { kind: "number", key: "strokeWidth", label: c.fields.borderWidth, min: 0, max: 20 },
        { kind: "number", key: "radius", label: c.fields.radius, min: 0, max: 100 },
      ],
    ],
  },
  divider: {
    type: "divider",
    name: c.types.divider.name,
    description: c.types.divider.description,
    category: "basic",
    icon: "divider",
    defaultSize: { width: 360, height: 24 },
    defaults: {
      orientation: "horizontal",
      thickness: 2,
      style: "solid",
      color: "#d1d5db",
      widthPercent: 100,
    },
    schema: [
      [
        { kind: "select", key: "orientation", label: c.fields.style, options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }] },
        { kind: "select", key: "style", label: c.fields.style, options: options(c.dividerStyles) },
        { kind: "number", key: "thickness", label: c.fields.thickness, min: 1, max: 20 },
        { kind: "color", key: "color", label: c.fields.color },
        { kind: "number", key: "widthPercent", label: c.fields.widthPercent, min: 10, max: 100, step: 5 },
      ],
    ],
  },
  container: {
    type: "container",
    name: c.types.container.name,
    description: c.types.container.description,
    category: "layout",
    icon: "container",
    defaultSize: { width: 360, height: 120 },
    defaults: {
      content: "",
      padding: 16,
      background: "transparent",
      borderWidth: 1,
      borderColor: "#d1d5db",
      radius: 8,
      shadow: "none",
      align: "left",
    },
    textProp: "content",
    schema: [
      [{ kind: "textarea", key: "content", label: c.fields.content, rows: 3 }],
      [
        { kind: "color", key: "background", label: c.fields.background },
        { kind: "number", key: "borderWidth", label: c.fields.borderWidth, min: 0, max: 20 },
        { kind: "color", key: "borderColor", label: c.fields.borderColor },
        { kind: "number", key: "radius", label: c.fields.radius, min: 0, max: 60 },
        { kind: "number", key: "padding", label: c.fields.padding, min: 0, max: 80 },
        { kind: "select", key: "shadow", label: c.fields.shadow, options: options(c.shadowOptions) },
      ],
    ],
  },
  header: {
    type: "header",
    name: c.types.header.name,
    description: c.types.header.description,
    category: "document",
    icon: "header",
    defaultSize: { width: 680, height: 56 },
    defaults: {
      company: "",
      title: "",
      align: "left",
      showDivider: true,
      background: "transparent",
      color: "",
      fontSize: 14,
      fontWeight: "600",
    },
    textProp: "title",
    schema: [
      [
        { kind: "text", key: "company", label: c.fields.company },
        { kind: "text", key: "title", label: c.fields.title },
        { kind: "select", key: "align", label: c.fields.align, options: options(c.alignOptions) },
        { kind: "toggle", key: "showDivider", label: c.fields.showDivider },
      ],
      [
        { kind: "color", key: "background", label: c.fields.background },
        { kind: "color", key: "color", label: c.fields.color },
        { kind: "number", key: "fontSize", label: c.fields.fontSize, min: 8, max: 60 },
        { kind: "select", key: "fontWeight", label: c.fields.fontWeight, options: weightOptions },
      ],
    ],
  },
  footer: {
    type: "footer",
    name: c.types.footer.name,
    description: c.types.footer.description,
    category: "document",
    icon: "footer",
    defaultSize: { width: 680, height: 40 },
    defaults: {
      left: "",
      center: "",
      right: "",
      pageNumber: true,
      showDivider: true,
      background: "transparent",
      color: "",
      fontSize: 12,
    },
    schema: [
      [
        { kind: "text", key: "left", label: c.fields.left },
        { kind: "text", key: "center", label: c.fields.center },
        { kind: "text", key: "right", label: c.fields.right },
        { kind: "toggle", key: "pageNumber", label: c.fields.pageNumber },
        { kind: "toggle", key: "showDivider", label: c.fields.showDivider },
      ],
      [
        { kind: "color", key: "background", label: c.fields.background },
        { kind: "color", key: "color", label: c.fields.color },
        { kind: "number", key: "fontSize", label: c.fields.fontSize, min: 8, max: 40 },
      ],
    ],
  },
  pageNumber: {
    type: "pageNumber",
    name: c.types.pageNumber.name,
    description: c.types.pageNumber.description,
    category: "document",
    icon: "pageNumber",
    defaultSize: { width: 160, height: 28 },
    defaults: {
      format: "Page {n} of {m}",
      align: "center",
      color: "",
      fontSize: 12,
    },
    schema: [
      [
        { kind: "text", key: "format", label: c.fields.format },
        { kind: "select", key: "align", label: c.fields.align, options: options(c.alignOptions) },
        { kind: "color", key: "color", label: c.fields.color },
        { kind: "number", key: "fontSize", label: c.fields.fontSize, min: 8, max: 40 },
      ],
    ],
  },
  table: {
    type: "table",
    name: c.types.table.name,
    description: c.types.table.description,
    category: "data",
    icon: "table",
    defaultSize: { width: 520, height: 160 },
    defaults: {
      rows: [
        ["Header 1", "Header 2"],
        ["", ""],
        ["", ""],
      ],
      colWidths: [] as number[],
      headerRow: true,
      headerBg: "#f3f4f6",
      headerColor: "",
      cellBg: "#ffffff",
      borderColor: "#d1d5db",
      borderWidth: 1,
      cellPadding: 6,
      align: "left",
      fontSize: 13,
      alternating: true,
      preset: "blank",
    },
    schema: [
      [{ kind: "select", key: "preset", label: c.fields.preset, options: options(c.tablePresets) }],
      [
        { kind: "toggle", key: "headerRow", label: c.fields.headerRow },
        { kind: "toggle", key: "alternating", label: c.fields.alternatingRows },
        { kind: "number", key: "fontSize", label: c.fields.fontSize, min: 8, max: 40 },
        { kind: "number", key: "cellPadding", label: c.fields.cellPadding, min: 0, max: 40 },
        { kind: "select", key: "align", label: c.fields.align, options: options(c.alignOptions) },
      ],
      [
        { kind: "color", key: "headerBg", label: c.fields.headerBg },
        { kind: "color", key: "headerColor", label: c.fields.headerColor },
        { kind: "color", key: "cellBg", label: c.fields.cellBg },
        { kind: "color", key: "borderColor", label: c.fields.border },
        { kind: "number", key: "borderWidth", label: c.fields.borderWidth, min: 0, max: 8 },
      ],
    ],
  },
  chart: {
    type: "chart",
    name: c.types.chart.name,
    description: c.types.chart.description,
    category: "data",
    icon: "chart",
    defaultSize: { width: 360, height: 220 },
    defaults: {
      kind: "bar",
      title: "Risk summary",
      data: "Critical 2\nHigh 5\nMedium 8\nLow 3",
      color: "",
      showValues: true,
    },
    schema: [
      [
        { kind: "text", key: "title", label: c.fields.title },
        { kind: "textarea", key: "data", label: c.fields.data, rows: 5 },
        { kind: "color", key: "color", label: c.fields.colorAccent },
        { kind: "toggle", key: "showValues", label: c.fields.showValues },
      ],
    ],
  },
  callout: {
    type: "callout",
    name: c.types.callout.name,
    description: c.types.callout.description,
    category: "content",
    icon: "callout",
    defaultSize: { width: 420, height: 88 },
    defaults: {
      variant: "info",
      title: "",
      content: "Add your message here.",
    },
    textProp: "content",
    schema: [
      [
        { kind: "select", key: "variant", label: c.fields.variant, options: options(c.calloutVariants) },
        { kind: "text", key: "title", label: c.fields.title },
        { kind: "textarea", key: "content", label: c.fields.content, rows: 3 },
      ],
    ],
  },
  list: {
    type: "list",
    name: c.types.list.name,
    description: c.types.list.description,
    category: "content",
    icon: "list",
    defaultSize: { width: 320, height: 96 },
    defaults: {
      kind: "bullet",
      items: "First item\nSecond item\nThird item",
      spacing: 6,
    },
    textProp: "items",
    schema: [
      [
        { kind: "select", key: "kind", label: c.fields.kind, options: [{ value: "bullet", label: "Bulleted" }, { value: "numbered", label: "Numbered" }] },
        { kind: "textarea", key: "items", label: c.fields.items, rows: 5 },
        { kind: "number", key: "spacing", label: c.fields.value, min: 0, max: 30 },
      ],
    ],
  },
  code: {
    type: "code",
    name: c.types.code.name,
    description: c.types.code.description,
    category: "content",
    icon: "code",
    defaultSize: { width: 420, height: 160 },
    defaults: {
      language: "javascript",
      code: "const greeting = 'Hello, world!';",
      showLabel: true,
    },
    textProp: "code",
    schema: [
      [
        { kind: "select", key: "language", label: c.fields.language, options: options(c.codeLanguages) },
        { kind: "textarea", key: "code", label: c.fields.content, rows: 8 },
        { kind: "toggle", key: "showLabel", label: c.fields.showLabel },
      ],
    ],
  },
  link: {
    type: "link",
    name: c.types.link.name,
    description: c.types.link.description,
    category: "content",
    icon: "link",
    defaultSize: { width: 240, height: 32 },
    defaults: {
      text: "Visit website",
      href: "https://example.com",
      color: "#2563eb",
      underline: true,
      fontSize: 14,
      weight: "500",
    },
    textProp: "text",
    schema: [
      [
        { kind: "text", key: "text", label: c.fields.text },
        { kind: "text", key: "href", label: c.fields.href },
        { kind: "color", key: "color", label: c.fields.color },
        { kind: "toggle", key: "underline", label: c.fields.underline },
        { kind: "number", key: "fontSize", label: c.fields.fontSize, min: 8, max: 60 },
      ],
    ],
  },
  severityBadge: {
    type: "severityBadge",
    name: c.types.severityBadge.name,
    description: c.types.severityBadge.description,
    category: "security",
    icon: "severity",
    defaultSize: { width: 140, height: 32 },
    defaults: {
      severity: "high",
      label: "",
      showLabel: true,
      size: "md",
    },
    schema: [
      [
        { kind: "select", key: "severity", label: c.fields.severity, options: options(c.severityOptions) },
        { kind: "text", key: "label", label: c.fields.label },
        { kind: "toggle", key: "showLabel", label: c.fields.showLabel },
      ],
    ],
  },
  finding: {
    type: "finding",
    name: c.types.finding.name,
    description: c.types.finding.description,
    category: "security",
    icon: "finding",
    defaultSize: { width: 560, height: 420 },
    defaults: {
      title: "Finding title",
      severity: "high",
      cvss: "8.1",
      status: "Open",
      affected: "https://app.example.com/api/v1/login",
      description:
        "Describe the vulnerability, when it was found, and what it affects.",
      impact: "Describe the business and technical impact.",
      evidence: "Paste evidence such as a request, response or screenshot note.",
      recommendation: "Explain the fix and any compensating controls.",
      references: "",
    },
    textProp: "title",
    schema: [
      [
        { kind: "text", key: "title", label: c.fields.title },
        { kind: "select", key: "severity", label: c.fields.severity, options: options(c.severityOptions) },
        { kind: "text", key: "cvss", label: c.fields.cvss },
        { kind: "text", key: "status", label: c.fields.status },
        { kind: "text", key: "affected", label: c.fields.affected },
      ],
      [
        { kind: "textarea", key: "description", label: c.fields.description, rows: 3 },
        { kind: "textarea", key: "impact", label: c.fields.impact, rows: 2 },
        { kind: "textarea", key: "evidence", label: c.fields.evidence, rows: 2 },
        { kind: "textarea", key: "recommendation", label: c.fields.recommendation, rows: 2 },
        { kind: "textarea", key: "references", label: c.fields.references, rows: 2 },
      ],
    ],
  },
  evidence: {
    type: "evidence",
    name: c.types.evidence.name,
    description: c.types.evidence.description,
    category: "security",
    icon: "evidence",
    defaultSize: { width: 420, height: 160 },
    defaults: {
      kind: "code",
      label: "Evidence",
      content: "GET /api/login HTTP/1.1\nHost: app.example.com",
      language: "http",
    },
    textProp: "content",
    schema: [
      [
        { kind: "select", key: "kind", label: c.fields.kind, options: options(c.evidenceKinds) },
        { kind: "text", key: "label", label: c.fields.label },
        { kind: "select", key: "language", label: c.fields.language, options: options(c.codeLanguages) },
        { kind: "textarea", key: "content", label: c.fields.content, rows: 6 },
      ],
    ],
  },
  apiRequest: {
    type: "apiRequest",
    name: c.types.apiRequest.name,
    description: c.types.apiRequest.description,
    category: "security",
    icon: "api",
    defaultSize: { width: 520, height: 320 },
    defaults: {
      method: "GET",
      url: "/api/v1/users",
      headers: "Authorization: Bearer <token>\nContent-Type: application/json",
      body: "",
      responseStatus: "200 OK",
      responseBody: "",
      showResponse: true,
    },
    textProp: "url",
    schema: [
      [
        { kind: "select", key: "method", label: c.fields.method, options: c.httpMethods.map((m) => ({ value: m, label: m })) },
        { kind: "text", key: "url", label: c.fields.url },
        { kind: "textarea", key: "headers", label: c.fields.headers, rows: 3 },
        { kind: "textarea", key: "body", label: c.fields.body, rows: 4 },
      ],
      [
        { kind: "toggle", key: "showResponse", label: c.fields.showResponse },
        { kind: "text", key: "responseStatus", label: c.fields.responseStatus },
        { kind: "textarea", key: "responseBody", label: c.fields.responseBody, rows: 4 },
      ],
    ],
  },
  testCaseTable: {
    type: "testCaseTable",
    name: c.types.testCaseTable.name,
    description: c.types.testCaseTable.description,
    category: "security",
    icon: "testCase",
    defaultSize: { width: 600, height: 220 },
    defaults: {
      rows: [
        ["TC-01", "Test case description", "Expected result", "Actual result", "Pass", "", ""],
      ],
      headerRow: true,
      fontSize: 12,
    },
    schema: [
      [
        { kind: "toggle", key: "headerRow", label: c.fields.headerRow },
        { kind: "number", key: "fontSize", label: c.fields.fontSize, min: 8, max: 30 },
      ],
    ],
  },
  badge: {
    type: "badge",
    name: c.types.badge.name,
    description: c.types.badge.description,
    category: "content",
    icon: "badge",
    defaultSize: { width: 120, height: 32 },
    defaults: {
      text: "Tag",
      variant: "primary",
    },
    textProp: "text",
    schema: [
      [
        { kind: "text", key: "text", label: c.fields.text },
        { kind: "select", key: "variant", label: c.fields.variant, options: options(c.badgeVariants) },
      ],
    ],
  },
}

export const CATEGORY_ORDER: ElementCategory[] = [
  "basic",
  "layout",
  "document",
  "data",
  "content",
  "security",
]

export const CATEGORY_META: Record<ElementCategory, { label: string; icon: IconName }> = {
  basic: { label: c.categories.basic, icon: "shape" },
  layout: { label: c.categories.layout, icon: "container" },
  document: { label: c.categories.document, icon: "header" },
  data: { label: c.categories.data, icon: "chart" },
  content: { label: c.categories.content, icon: "callout" },
  security: { label: c.categories.security, icon: "severity" },
}

export function definitionFor(type: string): ElementDefinition | undefined {
  return elementCatalog[type]
}

export function createElement(
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<DocElement> = {}
): DocElement {
  const definition = definitionFor(type)
  const size = definition?.defaultSize ?? { width, height }
  return {
    id: uid(),
    type,
    name: definition?.name ?? type,
    x,
    y,
    width: width || size.width,
    height: height || size.height,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    props: {
      ...(definition?.defaults ?? {}),
      ...(overrides.props ?? {}),
    },
    ...overrides,
  }
}

export function cloneElement(el: DocElement, offset = 16): DocElement {
  return {
    ...el,
    id: uid(),
    x: el.x + offset,
    y: el.y + offset,
    props: JSON.parse(JSON.stringify(el.props)) as Record<string, unknown>,
  }
}
