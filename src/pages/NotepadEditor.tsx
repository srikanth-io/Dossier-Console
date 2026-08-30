import { Fragment, useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { BlockEditor } from "@/components/common/block-editor"
import { GiphyPicker } from "@/components/common/giphy-picker"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import { icons, messages, type IconName } from "@/constants"
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
  const { id: projectId, noteId } = useParams<{ id: string; noteId: string }>()
  const pageId = noteId ?? ""
  const navigate = useNavigate()
  const { getPage, updatePage, getChildPages, pages } = usePages()

  const page = pageId ? getPage(pageId) : undefined
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
    if (!pageId) return
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
    updatePage(pageId, { title, content, icon })
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
    if (!pageId) return
    updatePage(pageId, { parentId: folderId })
    setSaved(false)
    toast.success(messages.pages.actions.moved)
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <icons.file className="size-12 text-muted-foreground/30" />
        <p className="text-lg font-medium text-muted-foreground">Page not found</p>
        <Button variant="outline" onClick={() => navigate(`/app/projects/${projectId}/notes`)}>
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

  const folderTargets = pages.filter(
    (p) => p.kind === "folder" && p.parentId === null && p.id !== pageId
  )
  const childPages = getChildPages(page.id)

  return (
    <div className="mx-auto max-w-3xl space-y-4" onKeyDown={handleKeyDown}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/app/projects/${projectId}/notes`}>{messages.pages.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbItems.slice(0, -1).map((crumb) => (
            <Fragment key={crumb.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/app/projects/${projectId}/notes/${crumb.id}`}>{crumb.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground">
              {page.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
              <DropdownMenuLabel>{messages.pages.actions.moveToFolder}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMoveToFolder(null)}>
                <icons.dashboard className="size-3.5" />
                {messages.pages.actions.homeRoot}
              </DropdownMenuItem>
              {folderTargets.map((f) => (
                <DropdownMenuItem key={f.id} onClick={() => handleMoveToFolder(f.id)}>
                  <icons.dossiers className="size-3.5" />
                  {f.title}
                </DropdownMenuItem>
              ))}
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
                onClick={() => updatePage(pageId, { favorite: !page.favorite })}
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
                  onClick={() => navigate(`/app/projects/${projectId}/notes/${child.id}`)}
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
