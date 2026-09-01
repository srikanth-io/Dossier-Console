import { useCallback, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { icons, ROUTES } from "@/constants"

import { cn } from "@/lib/utils"
import { useResumeLibrary } from "@/store/resumes"
import {
  isPdfName,
  readFileAsDataUrl,
  validateResume,
} from "@/services/uploads"

type SortKey = "updated" | "name" | "type"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function resumeStatus(resume: { fileUrl?: string }): "draft" | "complete" {
  return resume.fileUrl ? "complete" : "draft"
}

export function ResumeManager() {
  const navigate = useNavigate()
  const { resumes, addResume, removeResume } = useResumeLibrary()

  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("updated")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    let list = resumes.filter((r) =>
      r.name.toLowerCase().includes(query.toLowerCase())
    )
    switch (sort) {
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name))
        break
      case "type":
        list = [...list].sort((a, b) => a.type.localeCompare(b.type))
        break
      default:
        list = [...list].sort((a, b) => b.updated.localeCompare(a.updated))
    }
    return list
  }, [resumes, query, sort])

  const handleUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    const validFiles: File[] = []
    const errors: string[] = []
    for (const file of files.slice(0, 5)) {
      try {
        validateResume(file)
        validFiles.push(file)
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "Invalid file"}`)
      }
    }

    if (errors.length > 0) {
      toast.error(errors.join("\n"))
      return
    }

    for (const file of validFiles) {
      try {
        const fileUrl = await readFileAsDataUrl(file)
        addResume({
          name: file.name,
          type: isPdfName(file.name) ? "PDF" : "DOCX",
          size: formatBytes(file.size),
          updated: "Just now",
          source: "",
          fileUrl,
        })
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    toast("Resumes uploaded")
    setUploadOpen(false)
  }, [addResume])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    handleUpload(files)
  }, [handleUpload])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Manager"
        description="Manage your resume library"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setUploadOpen(true)}>
              <icons.upload className="size-4" /> Upload
            </Button>
            <Button variant="default" onClick={() => navigate(ROUTES.resumeBuilder)}>
              <icons.plus className="size-4" /> New Resume
            </Button>
          </div>
        }
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search resumes..."
      >
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
      </SearchFilterBar>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Drag & drop PDF or DOCX files, or browse to upload.
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "rounded-lg border-2 border-dashed p-16 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <icons.upload className="mx-auto size-16 text-muted-foreground" />
            <p className="mt-4 text-base text-muted-foreground">
              Drag & drop PDF or DOCX files here, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary underline"
              >
                browse
              </button>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(Array.from(e.target.files ?? []))}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<icons.openFile />}
          title={query ? "No resumes found" : "No resumes yet"}
          description={query ? undefined : "Upload or create your first resume."}
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                <icons.close /> Clear search
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUploadOpen(true)}>
                  <icons.upload /> Upload
                </Button>
                <Button onClick={() => navigate(ROUTES.resumeBuilder)}>
                  <icons.plus /> New Resume
                </Button>
              </div>
            )
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((resume) => (
                <TableRow key={resume.id}>
                  <TableCell className="font-medium">{resume.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{resume.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={resumeStatus(resume) === "complete" ? "success" : "default"}>
                      {resumeStatus(resume) === "complete" ? "Complete" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{resume.updated}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <icons.moreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`${ROUTES.resumeBuilder}/${resume.id}`)}>
                          <icons.pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleting({ id: resume.id, name: resume.name })}
                        >
                          <icons.trash className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete resume"
        description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleting) {
            removeResume(deleting.id)
            setDeleting(null)
          }
        }}
      />
    </div>
  )
}
