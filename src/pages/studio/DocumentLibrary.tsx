import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { commonMessages, icons, messages, ROUTES } from "@/constants"
import { createBlankDocument } from "@/document-engine/defaults"
import { exportDocumentToPdf } from "@/document-engine/export"
import type { DocDocument, TemplateCategory } from "@/document-engine/types"
import { useDocumentLibrary } from "@/store/documents"
import { cn } from "@/lib/utils"
import { CreateDocumentDialog } from "@/pages/studio/CreateDocumentDialog"
import { DocumentThumbnail } from "@/pages/studio/DocumentThumbnail"

type SortKey = "updated" | "created" | "name"

const DOC_TYPE_META: Record<string, { category: TemplateCategory; name: string }> = {
  blank: { category: "custom", name: "Untitled document" },
  resume: { category: "resume", name: "New Resume" },
  report: { category: "reports", name: "New Report" },
  study: { category: "study", name: "Study Material" },
  vapt: { category: "vapt", name: "VAPT Report" },
  invoice: { category: "invoices", name: "Invoice" },
  proposal: { category: "proposals", name: "Proposal" },
  certificate: { category: "certificates", name: "Certificate" },
  custom: { category: "custom", name: "Custom Document" },
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updated", label: messages.studio.library.sortUpdated },
  { value: "created", label: messages.studio.library.sortCreated },
  { value: "name", label: messages.studio.library.sortName },
]

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "now"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d`
  return new Date(iso).toLocaleDateString()
}

export function DocumentLibrary() {
  const navigate = useNavigate()
  const { documents, duplicateDocument, removeDocument, updateMeta, saveDocument } =
    useDocumentLibrary()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<TemplateCategory>("all")
  const [sort, setSort] = useState<SortKey>("updated")
  const [wizardOpen, setWizardOpen] = useState(false)
  const [rename, setRename] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState<{ id: string } | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [exporting, setExporting] = useState<string | null>(null)

  const categoryOptions: { value: TemplateCategory; label: string }[] = (
    Object.keys(messages.studio.categories) as TemplateCategory[]
  ).map((value) => ({ value, label: messages.studio.categories[value] }))

  const filtered = useMemo(() => {
    let list = documents.filter(
      (doc) =>
        (category === "all" || doc.category === category) &&
        doc.name.toLowerCase().includes(query.toLowerCase())
    )
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name)
      if (sort === "created") return b.createdAt.localeCompare(a.createdAt)
      return b.updatedAt.localeCompare(a.updatedAt)
    })
    return list
  }, [documents, query, category, sort])

  const previewing = previewId ? documents.find((doc) => doc.id === previewId) ?? null : null

  const handleCreate = (options: {
    docType: string
    pageSize: import("@/document-engine/types").PageSizeId
    orientation: import("@/document-engine/types").Orientation
    from: { kind: "blank" } | { kind: "template"; id: string }
  }) => {
    const meta = DOC_TYPE_META[options.docType] ?? DOC_TYPE_META.custom
    if (options.from.kind === "template") {
      const copy = duplicateDocument(options.from.id)
      if (copy) {
        setWizardOpen(false)
        navigate(`${ROUTES.studioEditor}?id=${copy.id}`)
      }
      return
    }
    const doc = createBlankDocument({
      name: meta.name,
      category: meta.category,
      type: options.docType,
      sizeId: options.pageSize,
      orientation: options.orientation,
    })
    const saved = saveDocument(doc)
    setWizardOpen(false)
    navigate(`${ROUTES.studioEditor}?id=${saved.id}`)
  }

  const openEditor = (id: string) => navigate(`${ROUTES.studioEditor}?id=${id}`)

  const handleExport = async (doc: DocDocument) => {
    setExporting(doc.id)
    try {
      await exportDocumentToPdf(doc, doc.name)
    } finally {
      setExporting(null)
    }
  }

  const handleDuplicate = (id: string) => {
    const copy = duplicateDocument(id)
    if (copy) openEditor(copy.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{messages.studio.library.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{messages.studio.library.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setWizardOpen(true)}>
            <icons.plus className="size-4" />
            {messages.studio.library.createTemplate}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <icons.search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={messages.studio.library.searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categoryOptions.slice(0, 7).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
          <SelectTrigger className="h-9 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <icons.file className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">
            {query || category !== "all" ? messages.studio.library.emptyResult : messages.studio.library.empty}
          </p>
          {!query && category === "all" && (
            <Button className="mt-4" size="sm" onClick={() => setWizardOpen(true)}>
              {messages.studio.library.createFirst}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                className="relative bg-muted/40 p-4"
                onClick={() => setPreviewId(doc.id)}
              >
                <DocumentThumbnail doc={doc} width={240} className="mx-auto max-w-full" />
                <Badge
                  variant="secondary"
                  className="absolute right-2 top-2 bg-background/90 backdrop-blur"
                >
                  {doc.category !== "all" ? messages.studio.categories[doc.category] : ""}
                </Badge>
              </button>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <button
                  type="button"
                  className="text-left text-sm font-semibold hover:underline"
                  onClick={() => openEditor(doc.id)}
                >
                  {doc.name}
                </button>
                <p className="text-xs text-muted-foreground">
                  {messages.studio.library.pages(doc.pages.length)} ·{" "}
                  {messages.studio.library.updatedAgo} {relativeTime(doc.updatedAt)}
                </p>
                <div className="mt-auto flex items-center justify-between gap-1">
                  <Button size="sm" className="h-8 flex-1 text-xs" onClick={() => openEditor(doc.id)}>
                    <icons.pencil className="size-3.5" />
                    {messages.studio.library.edit}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 px-0">
                        <icons.moreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => setPreviewId(doc.id)}>
                        <icons.eye className="size-4" />
                        {messages.studio.library.preview}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(doc.id)}>
                        <icons.duplicate className="size-4" />
                        {messages.studio.library.duplicate}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRename({ id: doc.id, name: doc.name })}>
                        <icons.pencil className="size-4" />
                        {messages.studio.library.rename}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={Boolean(exporting)}
                        onClick={() => handleExport(doc)}
                      >
                        <icons.export className="size-4" />
                        {exporting === doc.id ? messages.studio.editor.exporting : messages.studio.library.exportPdf}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleting({ id: doc.id })}
                      >
                        <icons.trash className="size-4" />
                        {messages.studio.library.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{messages.studio.library.usingLegacyResume}</p>

      <CreateDocumentDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        templates={documents}
        onCreate={handleCreate}
      />

      <Dialog open={Boolean(rename)} onOpenChange={(open) => !open && setRename(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{messages.studio.library.renameTitle}</DialogTitle>
          </DialogHeader>
          <Input
            value={rename?.name ?? ""}
            onChange={(event) =>
              setRename((prev) => (prev ? { ...prev, name: event.target.value } : prev))
            }
            placeholder={messages.studio.library.renamePlaceholder}
            className="h-9"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRename(null)}
            >
              {commonMessages.cancel}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!rename?.name.trim()}
              onClick={() => {
                if (rename) updateMeta(rename.id, { name: rename.name.trim() })
                setRename(null)
              }}
            >
              {commonMessages.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{messages.studio.library.deleteTitle}</DialogTitle>
            <DialogDescription>{messages.studio.library.deleteDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleting(null)}
            >
              {commonMessages.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (deleting) removeDocument(deleting.id)
                setDeleting(null)
              }}
            >
              {messages.studio.library.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewing)} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{messages.studio.library.previewDialogTitle}</DialogTitle>
          </DialogHeader>
          {previewing && (
            <div className="flex max-h-[70vh] flex-col items-center gap-3 overflow-y-auto py-2">
              <DocumentThumbnail doc={previewing} width={420} className="max-w-full" />
              <div className="flex gap-2">
                {previewing.pages.slice(1).map((page) => (
                  <DocumentThumbnail
                    key={page.id}
                    doc={{ ...previewing, pages: [page] }}
                    width={140}
                    className="max-w-full"
                  />
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (previewing) {
                  setPreviewId(null)
                  openEditor(previewing.id)
                }
              }}
            >
              {messages.studio.library.open}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
