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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/common/empty-state"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { CollectionGrid } from "@/components/common/collection-page"
import { icons } from "@/constants"
import { createBlankDocument } from "@/document-engine/defaults"
import { exportDocumentToPdf } from "@/document-engine/export"
import type { DocDocument, LibraryDocument, TemplateCategory } from "@/document-engine/types"
import { useDocumentLibrary } from "@/store/documents"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
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
  const {
    documents,
    getDocumentsByParent,
    getDocumentPath,
    duplicateDocument,
    removeDocument,
    saveDocument,
    addFolder,
    updateMeta,
  } = useDocumentLibrary()

  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("updated")
  const [wizardOpen, setWizardOpen] = useState(false)
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const breadcrumbs = useMemo(() => {
    if (!currentFolderId) return []
    return getDocumentPath(currentFolderId).slice(0, -1)
  }, [currentFolderId, getDocumentPath])

  const currentItems = useMemo(() => {
    if (!projectId) return []
    const items = getDocumentsByParent(projectId, currentFolderId)
    let list = query
      ? items.filter((doc) => doc.name.toLowerCase().includes(query.toLowerCase()))
      : items
    list = [...list].sort((a, b) => {
      if (a.kind === "folder" && b.kind !== "folder") return -1
      if (a.kind !== "folder" && b.kind === "folder") return 1
      if (sort === "name") return a.name.localeCompare(b.name)
      if (sort === "created") return b.createdAt.localeCompare(a.createdAt)
      return b.updatedAt.localeCompare(a.updatedAt)
    })
    return list
  }, [projectId, currentFolderId, getDocumentsByParent, query, sort])

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
        saveDocument({ ...copy, projectId } as DocDocument, projectId, currentFolderId)
        setWizardOpen(false)
        navigate(`../documents/${copy.id}`)
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
    const saved = saveDocument(doc, projectId, currentFolderId)
    setWizardOpen(false)
    navigate(`../documents/${saved.id}`)
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !projectId) return
    addFolder(newFolderName.trim(), projectId, currentFolderId)
    setNewFolderName("")
    setFolderDialogOpen(false)
    toast("Folder created")
  }

  const openEditor = (doc: LibraryDocument) => {
    if (doc.kind === "folder") {
      setCurrentFolderId(doc.id)
      setQuery("")
    } else {
      navigate(`../documents/${doc.id}`)
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
      saveDocument({ ...copy, projectId } as DocDocument, projectId, currentFolderId)
      toast("Document duplicated")
      openEditor(copy)
    }
  }

  const startRename = (doc: LibraryDocument) => {
    setRenamingId(doc.id)
    setRenameValue(doc.name)
  }

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      updateMeta(renamingId, { name: renameValue.trim() })
      toast("Renamed")
    }
    setRenamingId(null)
    setRenameValue("")
  }

  const handleMoveToRoot = (id: string) => {
    updateMeta(id, { parentId: null })
    toast("Moved to root")
  }

  return (
    <div className="space-y-6">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => { setCurrentFolderId(null); setQuery("") }}
            className="transition-colors hover:text-foreground"
          >
            All Documents
          </button>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.id} className="flex items-center gap-1.5">
              <icons.chevronRight className="size-3.5" />
              <button
                type="button"
                onClick={() => { setCurrentFolderId(crumb.id); setQuery("") }}
                className="transition-colors hover:text-foreground"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {currentItems.length} item{currentItems.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setFolderDialogOpen(true)}>
            <icons.dossiers className="size-4" /> New Folder
          </Button>
          <Button size="sm" onClick={() => setWizardOpen(true)}>
            <icons.plus className="size-4" /> New Document
          </Button>
        </div>
      </div>

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

      {currentItems.length === 0 ? (
        <EmptyState
          icon={<icons.fileCode />}
          title={query ? "No documents found" : currentFolderId ? "Empty folder" : "No documents yet"}
          description={
            query
              ? undefined
              : currentFolderId
                ? "This folder is empty. Create a document or folder inside it."
                : "Create your first document for this project."
          }
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                <icons.close /> Clear search
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setFolderDialogOpen(true)}>
                  <icons.dossiers /> New Folder
                </Button>
                <Button onClick={() => setWizardOpen(true)}>
                  <icons.plus /> New Document
                </Button>
              </div>
            )
          }
        />
      ) : (
        <CollectionGrid>
          {currentItems.map((doc, index) => (
            <div
              key={doc.id}
              className="group relative animate-fade-rise cursor-pointer"
              style={{ animationDelay: `${(index + 4) * 60}ms` }}
              onClick={() => openEditor(doc)}
            >
              <div className="h-full rounded-lg border bg-card transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-md">
                <div className="aspect-[4/3] overflow-hidden rounded-t-lg border-b bg-muted/30">
                  {doc.kind === "folder" ? (
                    <div className="flex h-full items-center justify-center bg-muted/20">
                      <icons.dossiers className="size-10 text-muted-foreground/40" />
                    </div>
                  ) : (
                    <DocumentThumbnail doc={doc as DocDocument} />
                  )}
                </div>
                <div className="p-3">
                  {renamingId === doc.id ? (
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename()
                        if (e.key === "Escape") { setRenamingId(null); setRenameValue("") }
                      }}
                      className="h-6 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {doc.kind === "folder"
                      ? `${doc.children.length} item${doc.children.length !== 1 ? "s" : ""}`
                      : relativeTime(doc.updatedAt)
                    }
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
                  <DropdownMenuItem onClick={() => openEditor(doc)}>
                    <icons.pencil className="size-4" /> {doc.kind === "folder" ? "Open" : "Edit"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => startRename(doc)}>
                    <icons.pencil className="size-4" /> Rename
                  </DropdownMenuItem>
                  {doc.kind !== "folder" && (
                    <DropdownMenuItem onClick={() => handleDuplicate(doc.id)}>
                      <icons.copy className="size-4" /> Duplicate
                    </DropdownMenuItem>
                  )}
                  {doc.kind !== "folder" && (
                    <DropdownMenuItem onClick={() => handleExport(doc as DocDocument)}>
                      <icons.download className="size-4" /> Export PDF
                    </DropdownMenuItem>
                  )}
                  {doc.parentId && (
                    <DropdownMenuItem onClick={() => handleMoveToRoot(doc.id)}>
                      <icons.openFile className="size-4" /> Move to root
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleting({ id: doc.id, name: doc.name })}>
                    <icons.trash className="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </CollectionGrid>
      )}

      <CreateDocumentDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        templates={documents}
        onCreate={handleCreate}
      />

      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>Create a folder to organize your documents.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete"
        description={`Are you sure you want to delete "${deleting?.name}"?${deleting?.id ? "" : ""} This will also delete all contents inside.`}
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
