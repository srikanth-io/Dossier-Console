import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { EmptyState } from "@/components/common/empty-state"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { icons } from "@/constants"
import { CollectionGrid } from "@/components/common/collection-page"
import { usePages, type PageEntry } from "@/store/pages"

type FilterTab = "all" | "pages" | "folders" | "favorites"

export function ProjectNotes() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPagesByProject, addPage, deletePage, updatePage } = usePages()

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [newPageTitle, setNewPageTitle] = useState("")
  const [newPageKind, setNewPageKind] = useState<"note" | "folder">("note")
  const [createOpen, setCreateOpen] = useState(false)

  const projectPages = useMemo(
    () => (projectId ? getPagesByProject(projectId) : []),
    [projectId, getPagesByProject]
  )

  const filtered = useMemo(() => {
    let list = projectPages
    if (filter === "pages") list = list.filter((p) => p.kind === "note")
    if (filter === "folders") list = list.filter((p) => p.kind === "folder")
    if (filter === "favorites") list = list.filter((p) => p.favorite)
    if (query) {
      list = list.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      )
    }
    return list.sort((a, b) => {
      if (a.kind === "folder" && b.kind !== "folder") return -1
      if (a.kind !== "folder" && b.kind === "folder") return 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [projectPages, filter, query])

  const handleCreate = () => {
    if (!newPageTitle.trim() || !projectId) return
    const created = addPage(newPageTitle.trim(), { kind: newPageKind, projectId })
    setNewPageTitle("")
    setNewPageKind("note")
    setCreateOpen(false)
    toast("Page created")
    navigate(`../notes/${created.id}`)
  }

  const handleDelete = () => {
    if (!deleteId) return
    deletePage(deleteId)
    setDeleteId(null)
    toast("Page deleted")
  }

  const openPage = (page: PageEntry) => {
    navigate(`../notes/${page.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} page{filtered.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <icons.plus className="size-4" /> New Page
        </Button>
      </div>

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search notes..."
      >
        <div className="flex gap-1">
          {(["all", "pages", "folders", "favorites"] as const).map((tab) => (
            <Button
              key={tab}
              variant={filter === tab ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(tab)}
              className="h-8 text-xs"
            >
              {tab === "all" && <icons.list className="size-3.5" />}
              {tab === "pages" && <icons.file className="size-3.5" />}
              {tab === "folders" && <icons.dossiers className="size-3.5" />}
              {tab === "favorites" && <icons.star className="size-3.5" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </SearchFilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<icons.file />}
          title={query ? "No pages found" : "No pages yet"}
          description={query ? undefined : "Create your first note for this project."}
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                <icons.close /> Clear search
              </Button>
            ) : (
              <Button onClick={() => setCreateOpen(true)}>
                <icons.plus /> New Page
              </Button>
            )
          }
        />
      ) : (
        <CollectionGrid>
          {filtered.map((page, index) => (
            <div
              key={page.id}
              className="group relative animate-fade-rise cursor-pointer"
              style={{ animationDelay: `${(index + 4) * 60}ms` }}
              onClick={() => openPage(page)}
            >
              <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{page.kind === "folder" ? "📁" : "📄"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{page.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {page.content.slice(0, 100).replace(/[#*>-]/g, "").trim() || "Empty page"}
                      </p>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {page.updatedAt}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={page.title}
                    className="absolute right-2 top-2 z-10 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <icons.moreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => openPage(page)}>
                    <icons.pencil className="size-4" /> Open
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      updatePage(page.id, { favorite: !page.favorite })
                      toast(page.favorite ? "Removed from favorites" : "Added to favorites")
                    }}
                  >
                    <icons.star className="size-4" />
                    {page.favorite ? "Unfavorite" : "Favorite"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(page.id)}>
                    <icons.trash className="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </CollectionGrid>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Page</DialogTitle>
            <DialogDescription>Create a new page in this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Page title"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex gap-2">
              <Button
                variant={newPageKind === "note" ? "default" : "outline"}
                size="sm"
                onClick={() => setNewPageKind("note")}
              >
                <icons.file className="size-4" /> Note
              </Button>
              <Button
                variant={newPageKind === "folder" ? "default" : "outline"}
                size="sm"
                onClick={() => setNewPageKind("folder")}
              >
                <icons.dossiers className="size-4" /> Folder
              </Button>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newPageTitle.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete page</DialogTitle>
            <DialogDescription>Are you sure you want to delete this page? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <icons.trash /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
