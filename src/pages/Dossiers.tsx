import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { commonMessages, icons, messages, ROUTES } from "@/constants"
import { getErrorMessage } from "@/lib/async"
import { RESUME_PREVIEW_CLASSES, renderLatex } from "@/lib/latexPreview"
import { useResumeLibrary } from "@/store/resumes"
import { DocxPreview } from "@/components/docx-preview"
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function Dossiers() {
  const navigate = useNavigate()
  const { resumes, addResume, removeResume } = useResumeLibrary()
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [state, setState] = useState<UploadState>({ phase: "idle" })
  const [dragActive, setDragActive] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{
    action: "edit" | "delete"
    id: string
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef(false)

  const PAGE_SIZE = 10

  const filtered = resumes.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const confirmTarget = confirm
    ? resumes.find((r) => r.id === confirm.id) ?? null
    : null

  const viewing = resumes.find((r) => r.id === viewingId) ?? null

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

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {messages.dossiers.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {messages.dossiers.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(ROUTES.resumeCreator)}>
            <icons.fileCode /> {messages.resume.createResume}
          </Button>
          <Button variant="outline" onClick={openDialog}>
            <icons.upload /> {messages.dossiers.uploadResume}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>{messages.dossiers.myResumes}</CardTitle>
            <CardDescription>
              {messages.dossiers.recordsCount(filtered.length)}
            </CardDescription>
          </div>
          <div className="relative">
            <icons.search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={messages.dossiers.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-56 pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-brand-accent-soft">
                <icons.file className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                {query ? messages.dossiers.emptyResult : messages.dossiers.noResumes}
              </p>
              <p className="text-sm text-muted-foreground">
                {query ? "" : messages.dossiers.emptyLibrary}
              </p>
              {!query && (
                <div className="flex gap-2">
                  <Button onClick={() => navigate(ROUTES.resumeCreator)}>
                    <icons.fileCode /> {messages.resume.createResume}
                  </Button>
                  <Button variant="outline" onClick={openDialog}>
                    <icons.upload /> {messages.dossiers.uploadResume}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{messages.dossiers.name}</TableHead>
                  <TableHead>{messages.dossiers.type}</TableHead>
                  <TableHead>{messages.dossiers.size}</TableHead>
                  <TableHead>{messages.dossiers.uploaded}</TableHead>
                  <TableHead className="text-right">
                    {commonMessages.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-accent-soft">
                          <icons.file className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.size}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.updated}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={messages.resume.view}
                          onClick={() => setViewingId(r.id)}
                        >
                          <icons.eye />
                        </Button>
                        {r.source ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={messages.resume.edit}
                            onClick={() => setConfirm({ action: "edit", id: r.id })}
                          >
                            <icons.pencil />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={messages.dossiers.downloadResume}
                          onClick={() => downloadResume(r.id)}
                        >
                          <icons.download />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={messages.dossiers.deleteResume}
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setConfirm({ action: "delete", id: r.id })}
                        >
                          <icons.trash />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-foreground/5 px-4 pt-4">
              <p className="text-xs text-muted-foreground">
                {messages.dossiers.showingRecords(
                  (safePage - 1) * PAGE_SIZE + 1,
                  Math.min(safePage * PAGE_SIZE, filtered.length),
                  filtered.length
                )}
              </p>
              <div className="flex items-center gap-1">
                <span className="pr-1 text-xs text-muted-foreground">
                  {messages.dossiers.pageOf(safePage, pageCount)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage <= 1}
                  aria-label={messages.dossiers.previousPage}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <icons.chevronLeft />
                  {messages.dossiers.previousPage}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage >= pageCount}
                  aria-label={messages.dossiers.nextPage}
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                >
                  {messages.dossiers.nextPage}
                  <icons.chevronRight />
                </Button>
              </div>
            </div>
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
              <div className="flex size-12 items-center justify-center rounded-full bg-brand-accent-soft">
                <icons.upload className="size-6 text-muted-foreground" />
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
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-accent-soft">
                        {item.status === "uploading" ? (
                          <icons.spinner className="size-4 animate-spin text-primary" />
                        ) : (
                          <icons.file className="size-4 text-muted-foreground" />
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
                  setConfirm({ action: "edit", id: viewing.id })
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

      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirm?.action === "delete"
                ? messages.dossiers.confirmDeleteTitle
                : messages.dossiers.confirmEditTitle}
            </DialogTitle>
            <DialogDescription>
              {confirm?.action === "delete"
                ? messages.dossiers.confirmDeleteDescription(confirmTarget?.name ?? "")
                : messages.dossiers.confirmEditDescription(confirmTarget?.name ?? "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{commonMessages.cancel}</Button>
            </DialogClose>
            {confirm?.action === "delete" ? (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm) removeResume(confirm.id)
                  setConfirm(null)
                }}
              >
                <icons.trash /> {commonMessages.delete}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (confirm)
                    navigate(`${ROUTES.resumeCreator}?edit=${confirm.id}`)
                  setConfirm(null)
                }}
              >
                <icons.pencil /> {commonMessages.edit}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
