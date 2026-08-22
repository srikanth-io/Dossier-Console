import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { DocxPreview } from "@/components/studio/docx-preview"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { StatusPill } from "@/components/domain/status-pill"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
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
import { Progress } from "@/components/ui/progress"
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
import { commonMessages, icons, messages, ROUTES, statusLabels } from "@/constants"
import { getErrorMessage } from "@/lib/async"
import { RESUME_PREVIEW_CLASSES, renderLatex } from "@/lib/latexPreview"
import { useResumeLibrary } from "@/store/resumes"
import {
  isDocxName,
  isPdfName,
  MAX_UPLOAD_FILES,
  readFileAsDataUrl,
  uploadResume,
  validateResume,
  type UploadProgress,
} from "@/services/uploads"

type UploadFileItem = {
  file: File
  status: "pending" | "uploading" | "done" | "error"
  progress: UploadProgress
  error?: string
}

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; files: UploadFileItem[]; warning?: string }
  | { phase: "success"; files: UploadFileItem[]; warning?: string }
  | { phase: "failed"; files: UploadFileItem[]; warning?: string }

type Status = "draft" | "complete"

type StatusFilter = "all" | Status

type SortKey = "updated" | "name" | "type"

type ConfirmState =
  | { kind: "edit"; id: string }
  | { kind: "delete"; id: string }
  | { kind: "bulkDelete" }
  | null

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function resumeStatus(resume: { fileUrl?: string }): Status {
  return resume.fileUrl ? "complete" : "draft"
}

function updatedRank(value: string): number {
  if (value === "Just now") return 0
  if (value === "Today") return 1
  if (value === "Yesterday") return 2
  const match = /^(\d+)\s+days? ago/.exec(value)
  return match ? 3 + Number(match[1]) : 4
}

export function Dossiers() {
  const navigate = useNavigate()
  const { resumes, addResume, removeResume } = useResumeLibrary()

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("updated")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [state, setState] = useState<UploadState>({ phase: "idle" })
  const [dragActive, setDragActive] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef(false)

  const types = useMemo(
    () => Array.from(new Set(resumes.map((r) => r.type))).sort(),
    [resumes]
  )

  const hasActiveFilters =
    query !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    sort !== "updated"

  const filtered = useMemo(() => {
    let list = resumes.filter((r) => {
      const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || resumeStatus(r) === statusFilter
      const matchesType = typeFilter === "all" || r.type === typeFilter
      return matchesQuery && matchesStatus && matchesType
    })
    switch (sort) {
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name))
        break
      case "type":
        list = [...list].sort((a, b) => a.type.localeCompare(b.type))
        break
      default:
        list = [...list].sort(
          (a, b) => updatedRank(a.updated) - updatedRank(b.updated)
        )
    }
    return list
  }, [resumes, query, statusFilter, typeFilter, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, pageCount)
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const visibleIds = visible.map((r) => r.id)
  const visibleSelectedCount = visibleIds.filter((id) => selected.has(id)).length
  const allVisibleSelected =
    visible.length > 0 && visibleSelectedCount === visible.length

  const confirmTarget =
    confirm?.kind === "edit" || confirm?.kind === "delete"
      ? (resumes.find((r) => r.id === confirm.id) ?? null)
      : null

  const viewing = resumes.find((r) => r.id === viewingId) ?? null

  useEffect(() => {
    setCurrentPage(1)
  }, [query, statusFilter, typeFilter, sort, pageSize])

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

  useEffect(() => {
    setSelected(new Set())
  }, [query, statusFilter, typeFilter, sort])

  const clearFilters = useCallback(() => {
    setQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
    setSort("updated")
  }, [])

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }, [allVisibleSelected, visibleIds])

  const handleBulkDelete = useCallback(() => {
    if (!selected.size) return
    selected.forEach((id) => removeResume(id))
    toast.success(messages.dossiers.deletedToast)
    setSelected(new Set())
    setConfirm(null)
  }, [selected, removeResume])

  const handleBulkExport = useCallback(() => {
    if (!selected.size) return
    toast.success(messages.dossiers.exportedToast)
    setSelected(new Set())
  }, [selected])

  const handleConfirm = useCallback(() => {
    if (!confirm) return
    if (confirm.kind === "edit") {
      navigate(`${ROUTES.resumeCreator}?edit=${confirm.id}`)
      setConfirm(null)
      return
    }
    if (confirm.kind === "delete") {
      removeResume(confirm.id)
      toast.success(messages.dossiers.deletedToast)
      setConfirm(null)
      return
    }
    handleBulkDelete()
  }, [confirm, navigate, removeResume, handleBulkDelete])

  const openDialog = useCallback(() => {
    abortRef.current = false
    setState({ phase: "idle" })
    setDragActive(false)
    setDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    abortRef.current = true
    setDialogOpen(false)
  }, [])

  const runUpload = useCallback(
    async (files: File[], warning?: string) => {
      abortRef.current = false
      const items: UploadFileItem[] = files.map((file) => ({
        file,
        status: "pending",
        progress: { percent: 0, bytesLoaded: 0, bytesTotal: file.size },
      }))
      setState({ phase: "uploading", files: items, warning })
      let allSucceeded = true
      for (let index = 0; index < items.length; index += 1) {
        if (abortRef.current) return
        const item = items[index]
        try {
          validateResume(item.file)
        } catch (error) {
          items[index] = { ...item, status: "error", error: getErrorMessage(error) }
          allSucceeded = false
          setState({ phase: "uploading", files: [...items], warning })
          continue
        }
        items[index] = { ...items[index], status: "uploading" }
        setState({ phase: "uploading", files: [...items], warning })
        try {
          await uploadResume(item.file, (progress) => {
            if (abortRef.current) return
            items[index] = { ...items[index], status: "uploading", progress }
            setState({ phase: "uploading", files: [...items], warning })
          })
          if (abortRef.current) return
          const fileUrl = await readFileAsDataUrl(item.file)
          if (abortRef.current) return
          addResume({
            name: item.file.name,
            type: isPdfName(item.file.name) ? "PDF" : "DOCX",
            size: formatBytes(item.file.size),
            updated: "Just now",
            source: "",
            fileUrl,
          })
          items[index] = { ...items[index], status: "done" }
          setState({ phase: "uploading", files: [...items], warning })
        } catch (error) {
          if (abortRef.current) return
          items[index] = { ...items[index], status: "error", error: getErrorMessage(error) }
          allSucceeded = false
          setState({ phase: "uploading", files: [...items], warning })
        }
      }
      if (abortRef.current) return
      setState({ phase: allSucceeded ? "success" : "failed", files: items, warning })
    },
    [addResume]
  )

  const pickFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return
      const warning =
        files.length > MAX_UPLOAD_FILES
          ? messages.dossiers.tooManyFiles
          : undefined
      runUpload(files.slice(0, MAX_UPLOAD_FILES), warning)
    },
    [runUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      pickFiles(Array.from(e.dataTransfer.files ?? []))
    },
    [pickFiles]
  )

  const downloadResume = useCallback((id: string) => {
    const resume = resumes.find((r) => r.id === id)
    if (!resume) return
    if (resume.fileUrl) {
      const anchor = document.createElement("a")
      anchor.href = resume.fileUrl
      anchor.download = resume.name
      anchor.click()
      return
    }
    const content =
      resume.source || `${resume.name}\n\n${resume.type} file, ${resume.size}`
    const blob = new Blob([content], {
      type: resume.source ? "application/x-tex" : "text/plain",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = resume.source ? resume.name.replace(/\.tex$/i, "") + ".tex" : resume.name
    anchor.click()
    URL.revokeObjectURL(url)
  }, [resumes])

  const uploadState = state.phase
  const uploadingIndex =
    state.phase === "uploading"
      ? state.files.findIndex((f) => f.status === "uploading")
      : -1
  const uploadingCount =
    uploadingIndex >= 0
      ? uploadingIndex + 1
      : state.phase === "uploading"
        ? state.files.length
        : 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={messages.dashboard.eyebrow}
        title={messages.dossiers.title}
        description={messages.dossiers.subtitle}
        actions={
          <>
            <Button variant="outline" onClick={openDialog}>
              <icons.upload /> {messages.dossiers.importFiles}
            </Button>
            <Button
              variant="default"
              onClick={() => navigate(ROUTES.resumeCreator)}
            >
              <icons.fileCode /> {messages.dossiers.newDocument}
            </Button>
          </>
        }
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder={messages.dossiers.searchPlaceholder}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-36" aria-label={messages.dossiers.filterStatus}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {messages.dossiers.statusFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value)}
          >
            <SelectTrigger className="w-32" aria-label={messages.dossiers.filterType}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{messages.dossiers.allTypes}</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as SortKey)}
          >
            <SelectTrigger className="w-36" aria-label={messages.dossiers.filterSort}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">{messages.dossiers.sortUpdated}</SelectItem>
              <SelectItem value="name">{messages.dossiers.sortName}</SelectItem>
              <SelectItem value="type">{messages.dossiers.sortType}</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <icons.close /> {messages.dossiers.clearFilters}
            </Button>
          )}
        </div>
      </SearchFilterBar>

      <Card className="animate-fade-rise" style={{ animationDelay: "60ms" }}>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>{messages.dossiers.myResumes}</CardTitle>
            <CardDescription>
              {messages.dossiers.recordsCount(filtered.length)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {selected.size > 0 && (
            <div className="mb-3 flex animate-fade-in flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/25 bg-primary-soft/80 px-4 py-2.5 dark:bg-primary/10">
              <p className="text-sm font-semibold text-primary">
                {messages.dossiers.selectedCount(selected.size)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10"
                  onClick={() => setConfirm({ kind: "bulkDelete" })}
                >
                  <icons.trash /> {messages.dossiers.bulkDelete}
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  <icons.download /> {messages.dossiers.bulkExport}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                >
                  <icons.close /> {messages.dossiers.clearSelection}
                </Button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon={
                hasActiveFilters ? <icons.search /> : <icons.file />
              }
              title={
                hasActiveFilters
                  ? messages.dossiers.emptyFiltered
                  : messages.dossiers.noResumes
              }
              description={
                hasActiveFilters
                  ? undefined
                  : messages.dossiers.emptyLibrary
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    {messages.dossiers.clearFilters}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => navigate(ROUTES.resumeCreator)}>
                      <icons.fileCode /> {messages.resume.createResume}
                    </Button>
                    <Button variant="outline" onClick={openDialog}>
                      <icons.upload /> {messages.dossiers.uploadResume}
                    </Button>
                  </div>
                )
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          allVisibleSelected
                            ? true
                            : visibleSelectedCount > 0
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={toggleAll}
                        aria-label={messages.dossiers.selectAll}
                      />
                    </TableHead>
                    <TableHead scope="col">{messages.dossiers.name}</TableHead>
                    <TableHead scope="col">{messages.dossiers.type}</TableHead>
                    <TableHead scope="col">{messages.dossiers.owner}</TableHead>
                    <TableHead scope="col">{messages.dossiers.updated}</TableHead>
                    <TableHead scope="col">{messages.dossiers.status}</TableHead>
                    <TableHead scope="col">{messages.dossiers.size}</TableHead>
                    <TableHead scope="col" className="text-right">
                      {commonMessages.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((r) => {
                    const status = resumeStatus(r)
                    return (
                      <TableRow
                        key={r.id}
                        data-state={selected.has(r.id) ? "selected" : undefined}
                      >
                        <TableCell className="w-10">
                          <Checkbox
                            checked={selected.has(r.id)}
                            onCheckedChange={() => toggleOne(r.id)}
                            aria-label={messages.dossiers.selectDocument(r.name)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft/70 text-primary dark:bg-primary/15">
                              <icons.file className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-56 truncate font-medium">
                                {r.name}
                              </p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {r.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.type}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {messages.dossiers.ownerSelf}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.updated}
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            status={status}
                            label={statusLabels[status]}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.size}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`${r.name} — ${commonMessages.actions}`}
                              >
                                <icons.moreVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => setViewingId(r.id)}
                              >
                                <icons.eye /> {messages.dossiers.viewDocument}
                              </DropdownMenuItem>
                              {r.source ? (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setConfirm({ kind: "edit", id: r.id })
                                  }
                                >
                                  <icons.pencil /> {messages.dossiers.editDocument}
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem
                                onSelect={() => downloadResume(r.id)}
                              >
                                <icons.download /> {messages.dossiers.downloadDocument}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() =>
                                  setConfirm({ kind: "delete", id: r.id })
                                }
                              >
                                <icons.trash /> {messages.dossiers.deleteDocument}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/5 pt-4">
                <p className="text-xs text-muted-foreground">
                  {messages.dossiers.showingRecords(
                    (safePage - 1) * pageSize + 1,
                    Math.min(safePage * pageSize, filtered.length),
                    filtered.length
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {messages.dossiers.pageSize}
                    </span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => setPageSize(Number(value))}
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-8 w-16"
                        aria-label={messages.dossiers.pageSize}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="pr-1 text-xs text-muted-foreground">
                      {messages.dossiers.pageOf(safePage, pageCount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={safePage <= 1}
                      aria-label={messages.dossiers.previousPage}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                    >
                      <icons.chevronLeft />
                      {messages.dossiers.previousPage}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={safePage >= pageCount}
                      aria-label={messages.dossiers.nextPage}
                      onClick={() =>
                        setCurrentPage((page) => Math.min(pageCount, page + 1))
                      }
                    >
                      {messages.dossiers.nextPage}
                      <icons.chevronRight />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? openDialog() : closeDialog())}>
        <DialogContent className="sm:max-w-md" showCloseButton={uploadState !== "uploading"}>
          <DialogHeader>
            <DialogTitle>{messages.dossiers.uploadTitle}</DialogTitle>
            <DialogDescription>
              {messages.dossiers.uploadDescription}
            </DialogDescription>
          </DialogHeader>

          {uploadState === "idle" && (
            <div
              className={`flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-center transition-colors ${
                dragActive ? "bg-brand-accent-soft" : "bg-muted/40"
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft/70 text-primary dark:bg-primary/15">
                <icons.upload className="size-6" />
              </div>
              <div>
                <p className="text-sm">{messages.dossiers.dropzoneHint}</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-base"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {messages.dossiers.browseFiles}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {messages.dossiers.supportedFormats}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={(e) => {
                  pickFiles(Array.from(e.target.files ?? []))
                  e.target.value = ""
                }}
              />
            </div>
          )}

          {state.phase === "uploading" && (
            <div className="space-y-3">
              {state.warning ? (
                <p className="text-xs font-medium text-destructive">
                  {state.warning}
                </p>
              ) : null}
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {state.files.map((item, index) => (
                  <div
                    key={`${item.file.name}-${index}`}
                    className="rounded-lg border border-foreground/5 bg-muted/20 p-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft/70 text-primary dark:bg-primary/15">
                        {item.status === "uploading" ? (
                          <icons.spinner className="size-4 animate-spin" />
                        ) : (
                          <icons.file className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(item.file.size)}
                        </p>
                      </div>
                      {item.status === "done" && (
                        <icons.checkCircle className="size-4 shrink-0 text-primary" />
                      )}
                      {item.status === "error" && (
                        <icons.alertCircle className="size-4 shrink-0 text-destructive" />
                      )}
                    </div>
                    {item.status === "uploading" && (
                      <>
                        <Progress value={item.progress.percent} className="mt-2" />
                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                          <span>
                            {messages.dossiers.uploadProgress(item.progress.percent)}
                          </span>
                          <span>
                            {formatBytes(item.progress.bytesLoaded)} /{" "}
                            {formatBytes(item.progress.bytesTotal)}
                          </span>
                        </div>
                      </>
                    )}
                    {item.status === "error" && item.error ? (
                      <p className="mt-1 text-xs text-destructive">{item.error}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {messages.dossiers.uploadingCount(uploadingCount, state.files.length)}
              </p>
            </div>
          )}

          {state.phase === "success" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <icons.checkCircle className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {messages.dossiers.uploadSuccessCount(state.files.length)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {messages.dossiers.uploadSuccessHint}
                </p>
              </div>
              {state.warning ? (
                <p className="text-xs font-medium text-destructive">
                  {state.warning}
                </p>
              ) : null}
            </div>
          )}

          {state.phase === "failed" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <icons.alertCircle className="size-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {messages.dossiers.uploadFailed}
                </p>
                <p className="text-sm text-muted-foreground">
                  {messages.dossiers.uploadFailedHint}
                </p>
                <p className="text-xs text-muted-foreground">
                  {messages.dossiers.uploadFailedCount(
                    state.files.filter((f) => f.status === "error").length
                  )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {uploadState === "idle" && (
              <DialogClose asChild>
                <Button variant="outline">{commonMessages.cancel}</Button>
              </DialogClose>
            )}

            {uploadState === "success" && (
              <DialogClose asChild>
                <Button>
                  <icons.check /> {commonMessages.save}
                </Button>
              </DialogClose>
            )}

            {uploadState === "failed" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    abortRef.current = false
                    setState({ phase: "idle" })
                  }}
                >
                  {messages.dossiers.chooseAnother}
                </Button>
                <Button
                  onClick={() =>
                    runUpload(
                      state.files
                        .filter((f) => f.status === "error")
                        .map((f) => f.file),
                      state.warning
                    )
                  }
                >
                  <icons.retry /> {messages.dossiers.retryUpload}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewingId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingId(null)
        }}
      >
        <DialogContent className="max-h-[92svh] gap-3 sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              {viewing ? `${viewing.id} · ${viewing.type} · ${viewing.size}` : ""}
            </DialogDescription>
          </DialogHeader>
          {viewing?.source ? (
            <div className="max-h-[72svh] overflow-y-auto rounded-xl bg-muted/30 p-6">
              <div
                className={RESUME_PREVIEW_CLASSES}
                dangerouslySetInnerHTML={{
                  __html: renderLatex(viewing.source),
                }}
              />
            </div>
          ) : viewing?.fileUrl ? (
            viewing.type === "PDF" ? (
              <iframe
                src={viewing.fileUrl}
                title={viewing.name}
                className="h-[72svh] w-full rounded-xl bg-muted/30"
              />
            ) : isDocxName(viewing.name) ? (
              <DocxPreview fileUrl={viewing.fileUrl} />
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <icons.file className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {messages.dossiers.previewNotAvailable}
                </p>
              </div>
            )
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {messages.resume.noSource}
            </p>
          )}
          <DialogFooter>
            {viewing?.source ? (
              <Button
                onClick={() => {
                  if (!viewing) return
                  setViewingId(null)
                  setConfirm({ kind: "edit", id: viewing.id })
                }}
              >
                <icons.pencil /> {messages.resume.edit}
              </Button>
            ) : viewing?.fileUrl ? (
              <Button
                variant="outline"
                onClick={() => window.open(viewing.fileUrl, "_blank")}
              >
                <icons.download /> {messages.dossiers.openFile}
              </Button>
            ) : null}
            <DialogClose asChild>
              <Button variant="outline">{commonMessages.cancel}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
        title={
          confirm?.kind === "delete"
            ? messages.dossiers.confirmDeleteTitle
            : confirm?.kind === "bulkDelete"
              ? messages.dossiers.bulkDeleteTitle
              : messages.dossiers.confirmEditTitle
        }
        description={
          confirm?.kind === "bulkDelete"
            ? messages.dossiers.bulkDeleteDescription(selected.size)
            : confirm?.kind === "delete"
              ? messages.dossiers.confirmDeleteDescription(confirmTarget?.name ?? "")
              : messages.dossiers.confirmEditDescription(confirmTarget?.name ?? "")
        }
        confirmLabel={
          confirm?.kind === "edit" ? commonMessages.edit : commonMessages.delete
        }
        variant={
          confirm?.kind === "edit" ? "default" : "danger"
        }
        onConfirm={handleConfirm}
      />
    </div>
  )
}
