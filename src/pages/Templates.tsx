import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { icons, messages, ROUTES } from "@/constants"
import { CollectionGrid, CollectionSection } from "@/components/common/collection-page"
import { resumeTemplates } from "@/data/resumeTemplates"
import { RESUME_PREVIEW_CLASSES, renderLatex } from "@/lib/latexPreview"
import { cn } from "@/lib/utils"

type Category = "all" | "professional" | "academic" | "minimal" | "creative"

const categoryByTemplate: Record<string, Exclude<Category, "all">> = {
  executive: "professional",
  classic: "professional",
  technical: "professional",
  academic: "academic",
  minimal: "minimal",
  compact: "minimal",
  sidebar: "minimal",
  modern: "creative",
  creative: "creative",
}

const categories: Category[] = [
  "all",
  "professional",
  "academic",
  "minimal",
  "creative",
]

export function Templates() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category>("all")
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  const previews = useMemo(
    () =>
      new Map(
        resumeTemplates.map((template) => [template.id, renderLatex(template.source)])
      ),
    []
  )

  const previewing =
    resumeTemplates.find((t) => t.id === previewingId) ?? null

  const filtered = resumeTemplates.filter((template) => {
    const matchesCategory =
      category === "all" || categoryByTemplate[template.id] === category
    const q = query.toLowerCase()
    const matchesQuery =
      template.name.toLowerCase().includes(q) ||
      template.description.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })

  const clearFilters = () => {
    setQuery("")
    setCategory("all")
  }

  const hasActiveFilters = query !== "" || category !== "all"

  const openInCreator = (id: string) =>
    navigate(`${ROUTES.resumeCreator}?template=${id}`)

  const downloadTex = (id: string) => {
    const template = resumeTemplates.find((t) => t.id === id)
    if (!template) return
    const blob = new Blob([template.source], { type: "application/x-tex" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${template.id}.tex`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success(messages.templates.downloadedToast)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={messages.dashboard.eyebrow}
        title={messages.templates.title}
        description={messages.templates.subtitle}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={ROUTES.templates}>{messages.templates.openInStudio}</Link>
            </Button>
            <Button
              variant="default"
              onClick={() => navigate(ROUTES.resumeCreator)}
            >
              <icons.fileCode /> {messages.templates.createResume}
            </Button>
          </>
        }
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder={messages.templates.searchPlaceholder}
      >
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as Category)}
        >
          <SelectTrigger className="w-40" aria-label={messages.templates.filterCategory}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((key) => (
              <SelectItem key={key} value={key}>
                {messages.templates.categories[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchFilterBar>

      <CollectionSection
        title={messages.templates.title}
        description={messages.templates.count(filtered.length)}
      >
      {filtered.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? <icons.search /> : <icons.templates />}
          title={
            hasActiveFilters
              ? messages.templates.emptyFiltered
              : messages.templates.emptyResult
          }
          description={undefined}
          action={
            <Button variant="outline" onClick={clearFilters}>
              <icons.close /> {messages.dossiers.clearFilters}
            </Button>
          }
        />
      ) : (
        <CollectionGrid>
          {filtered.map((template) => {
            const categoryKey = categoryByTemplate[template.id]
            return (
              <Card
                key={template.id}
                className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[3/4] bg-white [color-scheme:light]">
                  <div className="absolute inset-0 overflow-hidden p-3">
                    <div
                      className="w-[166.67%] origin-top-left"
                      style={{ transform: "scale(0.6)" }}
                    >
                      <div
                        className={cn(
                          RESUME_PREVIEW_CLASSES,
                          "text-[10px] [&_a]:!text-primary"
                        )}
                        dangerouslySetInnerHTML={{
                          __html: previews.get(template.id) ?? "",
                        }}
                      />
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                  {categoryKey && (
                    <Badge
                      variant="brand"
                      className="absolute top-3 left-3 shadow-sm"
                    >
                      {messages.templates.categories[categoryKey]}
                    </Badge>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/50 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPreviewingId(template.id)}
                    >
                      <icons.eye className="size-3.5" /> {messages.templates.preview}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openInCreator(template.id)}
                    >
                      <icons.pencil className="size-3.5" /> {messages.templates.edit}
                    </Button>
                  </div>
                </div>

                <CardContent className="flex-1 p-4">
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    {template.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <icons.code className="size-3.5" />
                    <span>{messages.templates.formatLatex}</span>
                    <span className="text-border">·</span>
                    <span>{messages.templates.sourceChars(template.source.length)}</span>
                  </div>
                </CardContent>

                <CardFooter className="justify-between gap-2 border-t border-border/60 px-4 py-3">
                  <Button
                    size="sm"
                    onClick={() => openInCreator(template.id)}
                  >
                    <icons.pencil className="size-3.5" /> {messages.templates.edit}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={messages.templates.moreActions}
                      >
                        <icons.moreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => setPreviewingId(template.id)}
                      >
                        <icons.eye /> {messages.templates.preview}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => downloadTex(template.id)}
                      >
                        <icons.download /> {messages.templates.downloadTex}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => openInCreator(template.id)}
                      >
                        <icons.openFile /> {messages.templates.openInCreator}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            )
          })}
        </CollectionGrid>
      )}
      </CollectionSection>

      <Dialog
        open={previewingId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewingId(null)
        }}
      >
        <DialogContent className="max-h-[92svh] gap-3 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {messages.templates.previewTitle(previewing?.name ?? "")}
            </DialogTitle>
            <DialogDescription>
              {previewing ? `${previewing.name} · ${messages.templates.formatLatex}` : ""}
            </DialogDescription>
          </DialogHeader>
          {previewing && (
            <div className="max-h-[72svh] overflow-y-auto rounded-xl bg-muted/30 p-6">
              <div
                className={RESUME_PREVIEW_CLASSES}
                dangerouslySetInnerHTML={{
                  __html: previews.get(previewing.id) ?? "",
                }}
              />
            </div>
          )}
          {previewing && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => downloadTex(previewing.id)}
              >
                <icons.download /> {messages.templates.downloadTex}
              </Button>
              <Button onClick={() => openInCreator(previewing.id)}>
                <icons.fileCode /> {messages.templates.createResume}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
