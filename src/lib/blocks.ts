export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletedList"
  | "numberedList"
  | "todo"
  | "toggle"
  | "quote"
  | "callout"
  | "code"
  | "divider"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "bookmark"
  | "table"
  | "columnList"
  | "row"
  | "tableOfContents"
  | "breadcrumb"
  | "mathEquation"
  | "templateButton"

export type InlineStyle = {
  type: "bold" | "italic" | "underline" | "strikethrough" | "code" | "link"
  value?: string
}

export type TextSegment = {
  text: string
  styles: InlineStyle[]
}

export type Block = {
  id: string
  type: BlockType
  content: TextSegment[]
  checked?: boolean
  open?: boolean
  language?: string
  caption?: string
  url?: string
  children: string[]
}

export type PageBlocks = {
  pageId: string
  blockOrder: string[]
  blocks: Record<string, Block>
}

export const BLOCK_TYPES: {
  type: BlockType
  label: string
  description: string
  icon: string
  category: string
  shortcut?: string
}[] = [
  { type: "paragraph", label: "Text", description: "Plain text block", icon: "¶", category: "Basic" },
  { type: "heading1", label: "Heading 1", description: "Large section heading", icon: "H1", category: "Basic", shortcut: "# " },
  { type: "heading2", label: "Heading 2", description: "Medium section heading", icon: "H2", category: "Basic", shortcut: "## " },
  { type: "heading3", label: "Heading 3", description: "Small section heading", icon: "H3", category: "Basic", shortcut: "### " },
  { type: "quote", label: "Quote", description: "Capture a quote", icon: "❝", category: "Basic", shortcut: "> " },
  { type: "callout", label: "Callout", description: "Make content stand out", icon: "💡", category: "Basic" },
  { type: "divider", label: "Divider", description: "Visual separator", icon: "—", category: "Basic" },
  { type: "bulletedList", label: "Bulleted List", description: "Create a simple list", icon: "•", category: "Lists", shortcut: "- " },
  { type: "numberedList", label: "Numbered List", description: "Create a numbered list", icon: "1.", category: "Lists", shortcut: "1. " },
  { type: "todo", label: "To-do", description: "Track tasks with a to-do list", icon: "☐", category: "Lists", shortcut: "[] " },
  { type: "toggle", label: "Toggle", description: "Expand or collapse content", icon: "▸", category: "Lists" },
  { type: "code", label: "Code Block", description: "Write code with syntax highlighting", icon: "<>", category: "Embeds", shortcut: "``` " },
  { type: "image", label: "Image", description: "Upload or embed an image", icon: "🖼", category: "Media" },
  { type: "video", label: "Video", description: "Embed a video", icon: "▶", category: "Media" },
  { type: "audio", label: "Audio", description: "Embed an audio file", icon: "🔊", category: "Media" },
  { type: "file", label: "File", description: "Attach any file", icon: "📎", category: "Media" },
  { type: "bookmark", label: "Bookmark", description: "Save a link bookmark", icon: "🔖", category: "Media" },
  { type: "table", label: "Table", description: "Create a data table", icon: "▦", category: "Embeds" },
  { type: "columnList", label: "Column List", description: "Arrange content in columns", icon: "▐▐", category: "Embeds" },
  { type: "row", label: "Row", description: "Horizontal layout container", icon: "▬", category: "Embeds" },
  { type: "tableOfContents", label: "Table of Contents", description: "Auto-generated heading list", icon: "📑", category: "Advanced" },
  { type: "breadcrumb", label: "Breadcrumb", description: "Page navigation trail", icon: "↩", category: "Advanced" },
  { type: "mathEquation", label: "Math Equation", description: "Write mathematical notation", icon: "∑", category: "Advanced" },
  { type: "templateButton", label: "Template Button", description: "Duplicate a block template", icon: "⧉", category: "Advanced" },
]

export function newBlockId(): string {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createBlock(type: BlockType, content?: TextSegment[]): Block {
  return {
    id: newBlockId(),
    type,
    content: content ?? [{ text: "", styles: [] }],
    checked: type === "todo" ? false : undefined,
    open: type === "toggle" ? true : undefined,
    language: type === "code" ? "javascript" : undefined,
    children: [],
  }
}

export function textToSegments(text: string): TextSegment[] {
  if (!text) return [{ text: "", styles: [] }]
  return [{ text, styles: [] }]
}

type MarkdownShortcut = {
  pattern: RegExp
  type: BlockType
}

const MARKDOWN_SHORTCUTS: MarkdownShortcut[] = [
  { pattern: /^###\s+/, type: "heading3" },
  { pattern: /^##\s+/, type: "heading2" },
  { pattern: /^#\s+/, type: "heading1" },
  { pattern: /^>\s+/, type: "quote" },
  { pattern: /^```\s*$/, type: "code" },
  { pattern: /^[-*]\s+/, type: "bulletedList" },
  { pattern: /^\d+\.\s+/, type: "numberedList" },
  { pattern: /^\[\]\s+/, type: "todo" },
]

export type MarkdownMatch = {
  type: BlockType
  prefixLength: number
}

export function detectMarkdownShortcut(text: string): MarkdownMatch | null {
  for (const shortcut of MARKDOWN_SHORTCUTS) {
    const match = text.match(shortcut.pattern)
    if (match) {
      return { type: shortcut.type, prefixLength: match[0].length }
    }
  }
  return null
}

export function getBlockPlaceholder(type: BlockType): string {
  switch (type) {
    case "paragraph":
      return "Type '/' for commands…"
    case "heading1":
      return "Heading 1"
    case "heading2":
      return "Heading 2"
    case "heading3":
      return "Heading 3"
    case "bulletedList":
      return "List item"
    case "numberedList":
      return "List item"
    case "todo":
      return "To-do"
    case "toggle":
      return "Toggle"
    case "quote":
      return "Empty quote"
    case "callout":
      return "Callout"
    case "code":
      return "Code"
    default:
      return ""
  }
}

export function getBlockTag(type: BlockType): string {
  switch (type) {
    case "heading1":
      return "h1"
    case "heading2":
      return "h2"
    case "heading3":
      return "h3"
    case "bulletedList":
    case "numberedList":
    case "todo":
      return "div"
    case "code":
      return "pre"
    case "quote":
      return "blockquote"
    default:
      return "div"
  }
}
