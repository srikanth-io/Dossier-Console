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

export const BLOCK_TYPES: { type: BlockType; label: string; icon: string; category: string; shortcut?: string }[] = [
  { type: "paragraph", label: "Text", icon: "¶", category: "Basic" },
  { type: "heading1", label: "Heading 1", icon: "H1", category: "Basic", shortcut: "# " },
  { type: "heading2", label: "Heading 2", icon: "H2", category: "Basic", shortcut: "## " },
  { type: "heading3", label: "Heading 3", icon: "H3", category: "Basic", shortcut: "### " },
  { type: "bulletedList", label: "Bulleted List", icon: "•", category: "Lists", shortcut: "- " },
  { type: "numberedList", label: "Numbered List", icon: "1.", category: "Lists", shortcut: "1. " },
  { type: "todo", label: "To-do", icon: "☐", category: "Lists", shortcut: "[] " },
  { type: "toggle", label: "Toggle", icon: "▸", category: "Lists" },
  { type: "quote", label: "Quote", icon: "❝", category: "Advanced", shortcut: "> " },
  { type: "callout", label: "Callout", icon: "💡", category: "Advanced" },
  { type: "code", label: "Code", icon: "<>", category: "Advanced", shortcut: "```" },
  { type: "divider", label: "Divider", icon: "—", category: "Advanced" },
  { type: "image", label: "Image", icon: "🖼", category: "Media" },
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
