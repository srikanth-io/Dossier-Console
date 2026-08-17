import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { BlockEditor } from "@/components/block-editor"
import { DatabaseTable, type DatabaseRow, type PropertyDef } from "@/components/database-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ROUTES, icons, messages } from "@/constants"
import { usePages } from "@/store/pages"
import { createBlock, type Block } from "@/lib/blocks"
import { cn } from "@/lib/utils"

const pageIcons = ["📄", "📋", "📝", "🗂️", "📊", "📈", "🎯", "💡", "🔧", "⚙️", "🗑️", "📁", "🗓️", "⏰", "🎨", "🖥️", "📦", "🚀"]

const DEMO_PROPERTIES: PropertyDef[] = [
  { id: "name", name: "Name", type: "title" },
  { id: "status", name: "Status", type: "status", options: ["Not started", "In progress", "Review", "Done"] },
  { id: "priority", name: "Priority", type: "select", options: ["High", "Medium", "Low"] },
  { id: "owner", name: "Owner", type: "person" },
  { id: "due", name: "Due Date", type: "date" },
]

const DEMO_ROWS: DatabaseRow[] = [
  { id: "r1", values: { name: "Build API", status: "In progress", priority: "High", owner: "Alex", due: "Aug 30" } },
  { id: "r2", values: { name: "Design UI", status: "Done", priority: "Medium", owner: "Sarah", due: "Aug 20" } },
  { id: "r3", values: { name: "Write tests", status: "Not started", priority: "Low", owner: "John", due: "Sep 05" } },
  { id: "r4", values: { name: "Setup CI/CD", status: "In progress", priority: "High", owner: "Alex", due: "Aug 25" } },
  { id: "r5", values: { name: "Documentation", status: "Review", priority: "Medium", owner: "Sarah", due: "Sep 01" } },
]

function parseContentToBlocks(content: string): Block[] {
  const lines = content.split("\n")
  const blocks: Block[] = []
  for (const line of lines) {
    if (line.startsWith("# ")) {
      blocks.push(createBlock("heading1", [{ text: line.slice(2), styles: [] }]))
    } else if (line.startsWith("## ")) {
      blocks.push(createBlock("heading2", [{ text: line.slice(3), styles: [] }]))
    } else if (line.startsWith("### ")) {
      blocks.push(createBlock("heading3", [{ text: line.slice(4), styles: [] }]))
    } else if (line.startsWith("- ")) {
      blocks.push(createBlock("bulletedList", [{ text: line.slice(2), styles: [] }]))
    } else if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const checked = line.startsWith("- [x] ")
      blocks.push({ ...createBlock("todo", [{ text: line.slice(6), styles: [] }]), checked })
    } else if (line.startsWith("> ")) {
      blocks.push(createBlock("quote", [{ text: line.slice(2), styles: [] }]))
    } else if (line === "---") {
      blocks.push(createBlock("divider"))
    } else if (line.trim()) {
      blocks.push(createBlock("paragraph", [{ text: line, styles: [] }]))
    }
  }
  if (blocks.length === 0) blocks.push(createBlock("paragraph"))
  return blocks
}

export function PageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPage, updatePage, getChildPages } = usePages()

  const page = id ? getPage(id) : undefined
  const [title, setTitle] = useState(page?.title ?? "")
  const [blocks, setBlocks] = useState<Block[]>([])
  const [saved, setSaved] = useState(true)
  const [icon, setIcon] = useState(page?.icon ?? "📄")
  const [showDb, setShowDb] = useState(false)

  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setIcon(page.icon)
      setBlocks(parseContentToBlocks(page.content))
      setSaved(true)
      setShowDb(page.id === "p-6")
    }
  }, [page?.id])

  useEffect(() => {
    if (page && title !== page.title) {
      setSaved(false)
    }
  }, [title])

  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks)
    setSaved(false)
  }, [])

  const handleSave = () => {
    if (!id) return
    const content = blocks
      .map((b) => {
        const text = b.content.map((s) => s.text).join("")
        if (b.type === "heading1") return `# ${text}`
        if (b.type === "heading2") return `## ${text}`
        if (b.type === "heading3") return `### ${text}`
        if (b.type === "bulletedList") return `- ${text}`
        if (b.type === "todo") return b.checked ? `- [x] ${text}` : `- [ ] ${text}`
        if (b.type === "quote") return `> ${text}`
        if (b.type === "divider") return "---"
        return text
      })
      .join("\n")
    updatePage(id, { title, content, icon })
    setSaved(true)
    toast.success(messages.pages.editor.saved)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      handleSave()
    }
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <icons.file className="size-12 text-muted-foreground/30" />
        <p className="text-lg font-medium text-muted-foreground">Page not found</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.pages)}>
          <icons.arrowLeft /> {messages.pages.editor.back}
        </Button>
      </div>
    )
  }

  const parentPage = page.parentId ? getPage(page.parentId) : null
  const childPages = getChildPages(page.id)

  return (
    <div className="mx-auto max-w-3xl space-y-4" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2"
          onClick={() => navigate(ROUTES.pages)}
        >
          <icons.arrowLeft className="size-3.5" />
          {messages.pages.editor.back}
        </Button>
        {parentPage && (
          <>
            <span className="text-muted-foreground/50">/</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2"
              onClick={() => navigate(`${ROUTES.pages}/${parentPage.id}`)}
            >
              {parentPage.icon} {parentPage.title}
            </Button>
          </>
        )}
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground">{page.title}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={icon}
              onChange={(e) => {
                setIcon(e.target.value)
                if (id) updatePage(id, { icon: e.target.value })
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Page icon"
            >
              {pageIcons.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <span className="text-3xl cursor-pointer group-hover:opacity-70 transition-opacity">
              {icon}
            </span>
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 bg-transparent px-0 font-heading text-2xl font-bold shadow-none focus-visible:ring-0"
            placeholder={messages.pages.untitled}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showDb ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1.5"
            onClick={() => setShowDb(!showDb)}
          >
            <icons.grid className="size-3.5" />
            Database
          </Button>
          <span className={cn(
            "text-xs transition-colors",
            saved ? "text-muted-foreground" : "text-amber-500"
          )}>
            {saved ? "Saved" : "Unsaved"}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "size-8",
                  page.favorite ? "text-amber-500" : "text-muted-foreground"
                )}
                onClick={() => updatePage(id!, { favorite: !page.favorite })}
              >
                {page.favorite ? (
                  <icons.sparkles className="size-4 fill-current" />
                ) : (
                  <icons.sparkles className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {page.favorite ? messages.pages.actions.unfavorite : messages.pages.actions.favorite}
            </TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={saved}>
            <icons.save className="size-3.5" />
            {messages.pages.editor.save}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Created {page.createdAt}</span>
        <span>·</span>
        <span>Updated {page.updatedAt}</span>
      </div>

      <Separator />

      {showDb ? (
        <DatabaseTable
          properties={DEMO_PROPERTIES}
          rows={DEMO_ROWS}
          title={page.title}
        />
      ) : (
        <BlockEditor
          blocks={blocks}
          onChange={handleBlocksChange}
        />
      )}

      {childPages.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Sub-pages
            </p>
            <div className="space-y-1">
              {childPages.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => navigate(`${ROUTES.pages}/${child.id}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                >
                  <span>{child.icon}</span>
                  <span className="font-medium">{child.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{child.updatedAt}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
