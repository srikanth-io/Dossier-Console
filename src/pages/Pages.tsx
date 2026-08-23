import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { CollectionSection } from "@/components/common/collection-page"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/common/page-header"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROUTES, icons, messages, type IconName } from "@/constants"
import { usePages } from "@/store/pages"
import { cn } from "@/lib/utils"

export function Pages() {
  const navigate = useNavigate()
  const { rootPages, getChildPages, addPage, deletePage, updatePage, currentWorkspace } = usePages()
  const [query, setQuery] = useState("")
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const allPages = rootPages.filter(
    (p) => (!favoriteOnly || p.favorite) && p.title.toLowerCase().includes(query.toLowerCase())
  )

  const hasActiveFilters = query !== "" || favoriteOnly

  const clearFilters = () => {
    setQuery("")
    setFavoriteOnly(false)
  }

  const handleCreate = () => {
    const page = addPage("Untitled")
    toast.success(messages.pages.actions.created)
    navigate(`${ROUTES.pages}/${page.id}`)
  }

  const handleDelete = () => {
    if (!deleteId) return
    deletePage(deleteId)
    toast.success(messages.pages.actions.deleted)
    setDeleteId(null)
  }

  const handleToggleFavorite = (id: string, current: boolean) => {
    updatePage(id, { favorite: !current })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={currentWorkspace.name}
        title={messages.pages.title}
        description={messages.pages.subtitle}
        actions={
          <Button variant="default" onClick={handleCreate}>
            <icons.plus /> {messages.pages.newPage}
          </Button>
        }
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder={messages.pages.searchPlaceholder}
      >
        <Select
          value={favoriteOnly ? "favorites" : "all"}
          onValueChange={(value) => setFavoriteOnly(value === "favorites")}
        >
          <SelectTrigger className="w-40" aria-label={messages.pages.filterLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{messages.pages.allPages}</SelectItem>
            <SelectItem value="favorites">{messages.pages.favoritePages}</SelectItem>
          </SelectContent>
        </Select>
      </SearchFilterBar>

      <CollectionSection
        title={messages.pages.title}
        description={messages.pages.count(allPages.length)}
      >
      {allPages.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? <icons.search /> : <icons.file />}
          title={
            hasActiveFilters ? "No pages found" : messages.pages.noPages
          }
          description={
            hasActiveFilters ? undefined : messages.pages.noPagesHint
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                <icons.close /> {messages.dossiers.clearFilters}
              </Button>
            ) : (
              <Button onClick={handleCreate}>
                <icons.plus /> {messages.pages.newPage}
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {allPages.map((page, index) => {
            const children = getChildPages(page.id)
            return (
              <Card
                key={page.id}
                className="animate-fade-rise group cursor-pointer transition-shadow hover:shadow-md"
                style={{ animationDelay: `${60 + index * 40}ms` }}
                onClick={() => navigate(`${ROUTES.pages}/${page.id}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const PageIcon = icons[page.icon as IconName] ?? icons.file
                      return <PageIcon className="size-5 shrink-0 text-muted-foreground" />
                    })()}
                    <div>
                      <CardTitle className="text-base">{page.title}</CardTitle>
                      <CardDescription className="mt-0.5">
                        {children.length > 0
                          ? `${children.length} sub-page${children.length > 1 ? "s" : ""} · `
                          : ""}
                        {page.updatedAt}
                      </CardDescription>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="size-8 opacity-0 group-hover:opacity-100">
                          <icons.moreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`${ROUTES.pages}/${page.id}`)}>
                          <icons.eye /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFavorite(page.id, page.favorite)}>
                          <icons.star /> {page.favorite ? messages.pages.actions.unfavorite : messages.pages.actions.favorite}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteId(page.id)}
                        >
                          <icons.trash /> {messages.pages.actions.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                {children.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {children.slice(0, 4).map((child) => {
                        const ChildIcon = icons[child.icon as IconName] ?? icons.file
                        return (
                          <Badge key={child.id} variant="secondary" className="text-xs gap-1">
                            <ChildIcon className="size-3" /> {child.title}
                          </Badge>
                        )
                      })}
                      {children.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{children.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
      </CollectionSection>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title={messages.pages.actions.deleteConfirm}
        description={messages.pages.actions.deleteConfirmDescription}
        confirmLabel={messages.pages.actions.delete}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
