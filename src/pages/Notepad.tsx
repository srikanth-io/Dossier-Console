import { Fragment, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { commonMessages, ROUTES, icons, messages, type IconName } from "@/constants"
import { CollectionGrid, CollectionSection } from "@/components/common/collection-page"
import { usePages } from "@/store/pages"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"
type FilterTab = "all" | "favorites" | "recent"

export function Notepad() {
  const navigate = useNavigate()
  const { pages, getPage, addPage, updatePage, deletePage } = usePages()
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  // Breadcrumb chain of ancestor folders for the current location.
  const folderTrail = useMemo(() => {
    const trail: { id: string; title: string }[] = []
    let cursor = currentFolderId
    while (cursor) {
      const parent = getPage(cursor)
      if (!parent) break
      trail.unshift({ id: parent.id, title: parent.title })
      cursor = parent.parentId
    }
    return trail
  }, [currentFolderId, getPage])

  const visibleItems = useMemo(() => {
    let result = pages.filter((p) => p.parentId === currentFolderId)

    if (filter === "favorites") {
      result = result.filter((p) => p.favorite)
    }

    if (query) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      )
    }

    return [...result].sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1
      return a.title.localeCompare(b.title)
    })
  }, [pages, currentFolderId, filter, query])

  const handleCreate = () => {
    const page = addPage("Untitled", { parentId: currentFolderId })
    toast.success(messages.pages.actions.created)
    navigate(`${ROUTES.notepad}/${page.id}`)
  }

  const handleCreateFolder = () => {
    addPage(messages.pages.newFolder, { kind: "folder", parentId: currentFolderId })
    toast.success(messages.pages.folderCreated)
  }

  const handleOpenItem = (page: (typeof visibleItems)[number]) => {
    if (page.kind === "folder") {
      setCurrentFolderId(page.id)
      setQuery("")
      setFilter("all")
    } else {
      navigate(`${ROUTES.notepad}/${page.id}`)
    }
  }

  const handleToggleFavorite = (id: string, current: boolean) => {
    updatePage(id, { favorite: !current })
  }

  const handleDelete = () => {
    if (!deleteId) return
    deletePage(deleteId)
    toast.success(messages.pages.actions.deleted)
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          currentFolderId ? (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={ROUTES.notepad} onClick={(e) => { e.preventDefault(); setCurrentFolderId(null) }}>
                    {messages.pages.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {folderTrail.map((crumb, index) => {
                  const last = index === folderTrail.length - 1
                  return (
                    <Fragment key={crumb.id}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {last ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={ROUTES.notepad}
                            onClick={(e) => { e.preventDefault(); setCurrentFolderId(crumb.id) }}
                          >
                            {crumb.title}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          ) : undefined
        }
        title={messages.pages.title}
        description={messages.pages.subtitle}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateFolder}>
              <icons.dossiers /> {messages.pages.newFolder}
            </Button>
            <Button variant="default" onClick={handleCreate}>
              <icons.plus /> {messages.pages.newPage}
            </Button>
          </div>
        }
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder={messages.pages.searchPlaceholder}
      >
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as FilterTab)}
        >
          <SelectTrigger className="w-40" aria-label={messages.pages.filterLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{messages.pages.allPages}</SelectItem>
            <SelectItem value="favorites">{messages.pages.favoritePages}</SelectItem>
            <SelectItem value="recent">{messages.pages.recentPages}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => setView("grid")}
          >
            <icons.grid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => setView("list")}
          >
            <icons.layoutList className="size-4" />
          </Button>
        </div>
      </SearchFilterBar>

      <CollectionSection
        title={messages.pages.title}
        description={messages.pages.count(visibleItems.length)}
      >
      {visibleItems.length === 0 ? (
        <EmptyState
          className="animate-fade-rise"
          style={{ animationDelay: "180ms" }}
          icon={<icons.file />}
          title={
            query
              ? "No pages found"
              : currentFolderId && filter === "all"
                ? messages.pages.emptyFolder
                : messages.pages.noPages
          }
          description={
            query
              ? "Try a different search term."
              : currentFolderId && filter === "all"
                ? messages.pages.emptyFolderHint
                : messages.pages.noPagesHint
          }
          action={
            !query ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCreateFolder}>
                  <icons.dossiers /> {messages.pages.newFolder}
                </Button>
                <Button onClick={handleCreate}>
                  <icons.plus /> {messages.pages.newPage}
                </Button>
              </div>
            ) : undefined
          }
        />
      ) : view === "grid" ? (
        <CollectionGrid>
          {visibleItems.map((page, index) => (
            <Card
              key={page.id}
              className="animate-fade-rise group cursor-pointer transition-shadow hover:shadow-md"
              style={{ animationDelay: `${180 + index * 40}ms` }}
              onClick={() => handleOpenItem(page)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const PageIcon =
                        page.kind === "folder"
                          ? icons.dossiers
                          : icons[page.icon as IconName] ?? icons.file
                      return (
                        <PageIcon
                          className={cn(
                            "size-5 shrink-0",
                            page.kind === "folder" ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      )
                    })()}
                    <div className="min-w-0">
                      <h3 className="font-heading text-sm font-bold text-foreground truncate">
                        {page.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {page.kind === "folder"
                          ? `${page.children.length} ${page.children.length === 1 ? "item" : "items"}`
                          : page.updatedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={cn(
                        "size-8",
                        page.favorite ? "text-amber-500" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                      )}
                      onClick={() => handleToggleFavorite(page.id, page.favorite)}
                    >
                      {page.favorite ? (
                        <icons.star className="size-4 fill-current" />
                      ) : (
                        <icons.star className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={messages.pages.actions.delete}
                      className="size-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      onClick={() => setDeleteId(page.id)}
                    >
                      <icons.trash className="size-4" />
                    </Button>
                  </div>
                </div>
                {page.kind === "note" && (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {page.content.replace(/[#*\->[\]]/g, "").trim().slice(0, 120)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </CollectionGrid>
      ) : (
        <div className="-mx-2 overflow-hidden">
          <div className="divide-y divide-border/60">
            {visibleItems.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => handleOpenItem(page)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                {(() => {
                  const PageIcon =
                    page.kind === "folder"
                      ? icons.dossiers
                      : icons[page.icon as IconName] ?? icons.file
                  return (
                    <PageIcon
                      className={cn(
                        "size-4 shrink-0",
                        page.kind === "folder" ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  )
                })()}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {page.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {page.kind === "folder"
                    ? `${page.children.length} ${page.children.length === 1 ? "item" : "items"}`
                    : page.updatedAt}
                </span>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex shrink-0 items-center gap-1"
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn(
                      "size-7",
                      page.favorite ? "text-amber-500" : "text-muted-foreground"
                    )}
                    onClick={() => handleToggleFavorite(page.id, page.favorite)}
                  >
                    {page.favorite ? (
                      <icons.star className="size-3.5 fill-current" />
                    ) : (
                      <icons.star className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={messages.pages.actions.delete}
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(page.id)}
                  >
                    <icons.trash className="size-3.5" />
                  </Button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      </CollectionSection>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{messages.pages.actions.deleteConfirm}</DialogTitle>
            <DialogDescription>
              {messages.pages.actions.deleteConfirmDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {commonMessages.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <icons.trash /> {messages.pages.actions.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
