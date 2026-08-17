import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

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
import { cn } from "@/lib/utils"

export function PageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPage, updatePage, getChildPages } = usePages()

  const page = id ? getPage(id) : undefined
  const [title, setTitle] = useState(page?.title ?? "")
  const [content, setContent] = useState(page?.content ?? "")
  const [saved, setSaved] = useState(true)
  const [icon, setIcon] = useState(page?.icon ?? "📄")
  const titleRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setContent(page.content)
      setIcon(page.icon)
      setSaved(true)
    }
  }, [page?.id])

  useEffect(() => {
    if (page && (title !== page.title || content !== page.content)) {
      setSaved(false)
    }
  }, [title, content])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    autoResize()
  }, [content, autoResize])

  const handleSave = () => {
    if (!id) return
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

  const pageIcons = ["📄", "📋", "📝", "🗂️", "📊", "📈", "🎯", "💡", "🔧", "⚙️", "🗑️", "📁", "🗓️", "⏰", "🎨", "🖥️", "📦", "🚀"]

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
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 bg-transparent px-0 font-heading text-2xl font-bold shadow-none focus-visible:ring-0"
            placeholder={messages.pages.untitled}
          />
        </div>
        <div className="flex items-center gap-2">
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

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          autoResize()
        }}
        className="min-h-[400px] w-full resize-none border-0 bg-transparent py-2 font-mono text-sm leading-relaxed text-foreground/90 shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
        placeholder={messages.pages.editor.placeholder}
      />

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
