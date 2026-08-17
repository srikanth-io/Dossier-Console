import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ROUTES, icons, messages, type IconName } from "@/constants"
import { usePages } from "@/store/pages"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"
type FilterTab = "all" | "favorites" | "recent"

export function Notepad() {
  const navigate = useNavigate()
  const { rootPages, addPage, updatePage, currentWorkspace } = usePages()
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  const [filter, setFilter] = useState<FilterTab>("all")

  const filteredPages = useMemo(() => {
    let result = rootPages

    if (filter === "favorites") {
      result = result.filter((p) => p.favorite)
    } else if (filter === "recent") {
      result = [...result].sort((a, b) => {
        const order = ["Just now", "2 min ago", "5 min ago", "10 min ago", "1 hour ago", "2 hours ago", "3 hours ago", "5 hours ago", "Yesterday", "2 days ago"]
        return order.indexOf(a.updatedAt) - order.indexOf(b.updatedAt)
      })
    }

    if (query) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      )
    }

    return result
  }, [rootPages, filter, query])

  const handleCreate = () => {
    const page = addPage("Untitled")
    toast.success(messages.pages.actions.created)
    navigate(`${ROUTES.notepad}/${page.id}`)
  }

  const handleToggleFavorite = (id: string, current: boolean) => {
    updatePage(id, { favorite: !current })
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-rise">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={ROUTES.notepad}>
                {currentWorkspace.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{messages.pages.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title={messages.pages.title}
        description={messages.pages.subtitle}
        actions={
          <Button variant="gradient" onClick={handleCreate}>
            <icons.plus /> {messages.pages.newPage}
          </Button>
        }
      />

      <Card className="animate-fade-rise" style={{ animationDelay: "60ms" }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative min-w-52 flex-1">
              <icons.search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={messages.pages.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8"
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      <div className="animate-fade-rise" style={{ animationDelay: "120ms" }}>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList variant="line">
            <TabsTrigger value="all">{messages.pages.allPages}</TabsTrigger>
            <TabsTrigger value="favorites">{messages.pages.favoritePages}</TabsTrigger>
            <TabsTrigger value="recent">{messages.pages.recentPages}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredPages.length === 0 ? (
        <Card className="animate-fade-rise" style={{ animationDelay: "180ms" }}>
          <CardContent className="py-16">
            <EmptyState
              icon={<icons.file />}
              title={query ? "No pages found" : messages.pages.noPages}
              description={query ? "Try a different search term." : messages.pages.noPagesHint}
              action={
                !query ? (
                  <Button onClick={handleCreate}>
                    <icons.plus /> {messages.pages.newPage}
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPages.map((page, index) => (
            <Card
              key={page.id}
              className="animate-fade-rise group cursor-pointer transition-shadow hover:shadow-md"
              style={{ animationDelay: `${180 + index * 40}ms` }}
              onClick={() => navigate(`${ROUTES.notepad}/${page.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const PageIcon = icons[page.icon as IconName] ?? icons.file
                      return <PageIcon className="size-5 shrink-0 text-muted-foreground" />
                    })()}
                    <div className="min-w-0">
                      <h3 className="font-heading text-sm font-bold text-foreground truncate">
                        {page.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {page.updatedAt}
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
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {page.content.replace(/[#*\->[\]]/g, "").trim().slice(0, 120)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-fade-rise overflow-hidden" style={{ animationDelay: "180ms" }}>
          <div className="divide-y divide-border/60">
            {filteredPages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => navigate(`${ROUTES.notepad}/${page.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                {(() => {
                  const PageIcon = icons[page.icon as IconName] ?? icons.file
                  return <PageIcon className="size-4 shrink-0 text-muted-foreground" />
                })()}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {page.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {page.updatedAt}
                </span>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn(
                      "size-7",
                      page.favorite ? "text-amber-500" : "text-muted-foreground opacity-0 group-hover/row:opacity-100"
                    )}
                    onClick={() => handleToggleFavorite(page.id, page.favorite)}
                  >
                    {page.favorite ? (
                      <icons.star className="size-3.5 fill-current" />
                    ) : (
                      <icons.star className="size-3.5" />
                    )}
                  </Button>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
