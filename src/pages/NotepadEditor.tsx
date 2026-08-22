import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { BlockEditor } from "@/components/common/block-editor"
import { FolderBreadcrumb } from "@/components/common/folder-breadcrumb"
import { GiphyPicker } from "@/components/common/giphy-picker"
import { Button } from "@/components/ui/button"
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ROUTES, icons, messages, type IconName } from "@/constants"
import { usePages } from "@/store/pages"
import { createBlock, type Block } from "@/lib/blocks"
import { cn } from "@/lib/utils"

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

export function NotepadEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPage, updatePage, getChildPages, pages } = usePages()

  const page = id ? getPage(id) : undefined
  const [title, setTitle] = useState(page?.title ?? "")
  const [blocks, setBlocks] = useState<Block[]>([])
  const [saved, setSaved] = useState(true)
  const [icon, setIcon] = useState(page?.icon ?? "file")
  const [showGiphyPicker, setShowGiphyPicker] = useState(false)

  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setIcon(page.icon)
      setBlocks(parseContentToBlocks(page.content))
      setSaved(true)
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

  const handleGifSelect = (_gifUrl: string) => {
    setShowGiphyPicker(false)
    toast.success("GIF selected")
  }

  const handleMoveToFolder = (folderId: string | null) => {
    if (!id) return
    updatePage(id, { parentId: folderId } as never)
    setSaved(false)
    toast.success("Page moved")
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <icons.file className="size-12 text-muted-foreground/30" />
        <p className="text-lg font-medium text-muted-foreground">Page not found</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.notepad)}>
          <icons.arrowLeft /> {messages.pages.editor.back}
        </Button>
      </div>
    )
  }

  const breadcrumbItems = (() => {
    const path: { id: string; name: string; icon?: string }[] = []
    let current: typeof page | undefined = page
    while (current) {
      path.unshift({ id: current.id, name: current.title, icon: current.icon })
      current = current.parentId ? getPage(current.parentId) : undefined
    }
    return path
  })()

  const rootPages = pages.filter((p) => p.parentId === null && p.id !== id)
  const childPages = getChildPages(page.id)

  return (
    <div className="mx-auto max-w-3xl space-y-4" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2"
          onClick={() => navigate(ROUTES.notepad)}
        >
          <icons.arrowLeft className="size-3.5" />
          {messages.pages.editor.back}
        </Button>
      </div>

      <FolderBreadcrumb
        items={breadcrumbItems.map((b) => ({
          id: b.id,
          type: "page" as const,
          name: b.name,
          parentId: null,
          icon: b.icon,
        }))}
        onNavigate={(itemId) => {
          if (itemId) {
            navigate(`${ROUTES.notepad}/${itemId}`)
          } else {
            navigate(ROUTES.notepad)
          }
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              className="cursor-pointer transition-opacity hover:opacity-70"
              onClick={() => setShowGiphyPicker(!showGiphyPicker)}
              title="Change icon"
            >
              {(() => {
                const CurrentIcon = icons[icon as IconName] ?? icons.file
                return <CurrentIcon className="size-7 text-muted-foreground" />
              })()}
            </button>
            {showGiphyPicker && (
              <div className="absolute left-0 top-full z-50 mt-1">
                <GiphyPicker
                  onSelect={handleGifSelect}
                />
              </div>
            )}
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 bg-transparent px-0 font-heading text-2xl font-bold shadow-none focus-visible:ring-0"
            placeholder={messages.pages.untitled}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5">
                <icons.openFile className="size-3.5" />
                Move
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Move to folder</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMoveToFolder(null)}>
                <icons.dashboard className="size-3.5" />
                Home (root)
              </DropdownMenuItem>
              {rootPages.filter((p) => p.id !== id).map((p) => {
                const PageIcon = icons[p.icon as IconName] ?? icons.file
                return (
                  <DropdownMenuItem key={p.id} onClick={() => handleMoveToFolder(p.id)}>
                    <PageIcon className="size-3.5" />
                    {p.title}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

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
                  <icons.star className="size-4 fill-current" />
                ) : (
                  <icons.star className="size-4" />
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
        <span>{messages.pages.createdAt} {page.createdAt}</span>
        <span>·</span>
        <span>{messages.pages.updatedAt} {page.updatedAt}</span>
      </div>

      <div className="min-h-[400px]">
        <BlockEditor
          blocks={blocks}
          onChange={handleBlocksChange}
        />
      </div>

      {childPages.length > 0 && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Sub-pages
          </p>
          <div className="space-y-1">
            {childPages.map((child) => {
              const ChildIcon = icons[child.icon as IconName] ?? icons.file
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => navigate(`${ROUTES.notepad}/${child.id}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                >
                  <ChildIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{child.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{child.updatedAt}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
