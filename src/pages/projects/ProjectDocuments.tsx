import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/common/empty-state"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { CollectionGrid, CollectionSection } from "@/components/common/collection-page"
import { icons, ROUTES } from "@/constants"
import { createBlankDocument } from "@/document-engine/defaults"
import { exportDocumentToPdf } from "@/document-engine/export"
import type { DocDocument, TemplateCategory } from "@/document-engine/types"
import { useDocumentLibrary } from "@/store/documents"
import { useProjects } from "@/store/projects"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { PageHeader } from "@/components/common/page-header"
import { CreateDocumentDialog } from "@/pages/studio/CreateDocumentDialog"
import { DocumentThumbnail } from "@/pages/studio/DocumentThumbnail"
import { toast } from "sonner"

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

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function ProjectDocuments() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects } = useProjects()
  const { documents, getDocumentsByProject, duplicateDocument, removeDocument, saveDocument } =
    useDocumentLibrary()

  const project = projects.find((p) => p.id === projectId)

  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("updated")
  const [wizardOpen, setWizardOpen] = useState(false)
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null)

  const projectDocs = useMemo(
    () => (projectId ? getDocumentsByProject(projectId) : []),
    [projectId, getDocumentsByProject]
  )

  const filtered = useMemo(() => {
    let list = projectDocs.filter((doc) =>
      doc.name.toLowerCase().includes(query.toLowerCase())
    )
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name)
      if (sort === "created") return b.createdAt.localeCompare(a.createdAt)
      return b.updatedAt.localeCompare(a.updatedAt)
    })
    return list
  }, [projectDocs, query, sort])

  const handleCreate = (options: {
    docType: string
    pageSize: import("@/document-engine/types").PageSizeId
    orientation: import("@/document-engine/types").Orientation
    from: { kind: "blank" } | { kind: "template"; id: string }
  }) => {
    const meta = DOC_TYPE_META[options.docType] ?? DOC_TYPE_META.custom
    if (options.from.kind === "template") {
      const copy = duplicateDocument(options.from.id)
      if (copy && projectId) {
        // Update the copy's projectId
        saveDocument({ ...copy, projectId } as DocDocument, projectId)
        setWizardOpen(false)
        navigate(`${ROUTES.projects}/${projectId}/documents/${copy.id}`)
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
    const saved = saveDocument(doc, projectId)
    setWizardOpen(false)
    navigate(`${ROUTES.projects}/${projectId}/documents/${saved.id}`)
  }

  const openEditor = (id: string) => {
    if (projectId) {
      navigate(`${ROUTES.projects}/${projectId}/documents/${id}`)
    }
  }

  const handleExport = async (doc: DocDocument) => {
    try {
      await exportDocumentToPdf(doc, doc.name)
    } catch {
      toast("Export failed")
    }
  }

  const handleDuplicate = (id: string) => {
    const copy = duplicateDocument(id)
    if (copy && projectId) {
      saveDocument({ ...copy, projectId } as DocDocument, projectId)
      toast("Document duplicated")
      openEditor(copy.id)
    }
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={<icons.dossiers />}
          title="Project not found"
          description="This project may have been deleted."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${project.name} — Documents`}
        description={`${filtered.length} document${filtered.length !== 1 ? "s" : ""}`}
        actions={
          <Button size="sm" variant="default" className="h-9 px-4" onClick={() => setWizardOpen(true)}>
            <icons.plus className="size-4" />
            New Document
          </Button>
        }
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search documents..."
      >
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="updated">Last updated</option>
          <option value="created">Created</option>
          <option value="name">Name</option>
        </select>
      </SearchFilterBar>

      <CollectionSection
        title="Documents"
        description={`${filtered.length} document${filtered.length !== 1 ? "s" : ""}`}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={<icons.fileCode />}
            title={query ? "No documents found" : "No documents yet"}
            description={query ? undefined : "Create your first document for this project."}
            action={
              query ? (
                <Button variant="outline" onClick={() => setQuery("")}>
                  <icons.close /> Clear search
                </Button>
              ) : (
                <Button onClick={() => setWizardOpen(true)}>
                  <icons.plus /> New Document
                </Button>
              )
            }
          />
        ) : (
          <CollectionGrid>
            {filtered.map((doc, index) => (
              <div
                key={doc.id}
                className="group relative animate-fade-rise cursor-pointer"
                style={{ animationDelay: `${(index + 4) * 60}ms` }}
                onClick={() => openEditor(doc.id)}
              >
                <div className="h-full rounded-lg border bg-card transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-md">
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg border-b bg-muted/30">
                    <DocumentThumbnail doc={doc as DocDocument} />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {relativeTime(doc.updatedAt)}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={doc.name}
                      className="absolute right-2 top-2 z-10 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <icons.moreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => openEditor(doc.id)}>
                      <icons.pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(doc.id)}>
                      <icons.copy className="size-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(doc as DocDocument)}>
                      <icons.download className="size-4" />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleting({ id: doc.id, name: doc.name })}
                    >
                      <icons.trash className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CollectionGrid>
        )}
      </CollectionSection>

      <CreateDocumentDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        templates={documents}
        onCreate={handleCreate}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete document"
        description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleting) {
            removeDocument(deleting.id)
            setDeleting(null)
          }
        }}
      />
    </div>
  )
}
