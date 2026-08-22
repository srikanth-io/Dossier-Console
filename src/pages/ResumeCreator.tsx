import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [query])
  return matches
}
import { StreamLanguage } from "@codemirror/language"
import { stex } from "@codemirror/legacy-modes/mode/stex"

import { CodeEditor, type CodeEditorApi } from "@/components/common/code-editor"
import { TemplateManagerDialog } from "@/components/common/template-manager-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { icons, messages, ROUTES } from "@/constants"
import { resumeTemplates } from "@/data/resumeTemplates"
import { safeAsync } from "@/lib/async"
import {
  getLatexSections,
  renderInline,
  RESUME_PREVIEW_CLASSES,
  renderLatex,
} from "@/lib/latexPreview"
import { exportPreviewToPdf } from "@/lib/pdfExport"
import { cn } from "@/lib/utils"
import { useResumeLibrary } from "@/store/resumes"

export function ResumeCreator() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get("edit")
  const templateParam = searchParams.get("template")
  const { resumes, addResume, updateResume } = useResumeLibrary()
  const isLg = useMediaQuery("(min-width: 1024px)")

  const editing = useMemo(
    () => resumes.find((r) => r.id === editId) ?? null,
    [resumes, editId]
  )

  const [templateId, setTemplateId] = useState(
    editing ? "" : resumeTemplates[0]?.id ?? ""
  )
  const [fileName, setFileName] = useState(
    editing?.name ?? "My_Resume.tex"
  )
  const [source, setSource] = useState(
    editing?.source ?? resumeTemplates[0]?.source ?? ""
  )
  const [saved, setSaved] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportFailed, setExportFailed] = useState(false)
  const editorApiRef = useRef<CodeEditorApi | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [editorPct, setEditorPct] = useState(38)
  const [previewPages, setPreviewPages] = useState<string[]>([""])

  const activeTemplate = resumeTemplates.find((t) => t.id === templateId)

  const loadTemplate = useCallback((id: string) => {
    const template = resumeTemplates.find((t) => t.id === id)
    if (!template) return
    setTemplateId(id)
    setSource(template.source)
    setFileName(`Resume_${template.name.replace(/\s+/g, "_")}.tex`)
    setSaved(false)
  }, [])

  const loadResume = useCallback(
    (id: string) => {
      const resume = resumes.find((r) => r.id === id)
      if (!resume) return
      setTemplateId("")
      setSource(resume.source)
      setFileName(resume.name)
      setSaved(false)
      navigate(`${ROUTES.resumeCreator}?edit=${id}`, { replace: true })
    },
    [resumes, navigate]
  )

  useEffect(() => {
    if (editing) {
      setSource(editing.source)
      setFileName(editing.name)
      setTemplateId("")
    }
  }, [editing])

  useEffect(() => {
    if (!editId && templateParam) {
      loadTemplate(templateParam)
    }
  }, [editId, templateParam, loadTemplate])

  useEffect(() => {
    if (!editId && !templateParam && !templateId) {
      loadTemplate(resumeTemplates[0]?.id ?? "")
    }
  }, [editId, templateParam, templateId, loadTemplate])

  const previewHtml = useMemo(() => renderLatex(source), [source])

  const sections = useMemo(() => getLatexSections(source), [source])

  const A4_ASPECT = 210 / 297
  const A4_PADDING = 32
  const [scaledDims, setScaledDims] = useState({ width: 595, height: 842 })

  useEffect(() => {
    if (!source.trim()) {
      setPreviewPages([""])
      return
    }
    const el = previewRef.current
    if (!el) return

    const pageContainer = containerRef.current?.querySelector("[data-preview-page]")
    const availableWidth = (pageContainer?.parentElement?.clientWidth ?? 595) - 32
    const pageWidth = Math.min(availableWidth, 595)
    const pageHeight = Math.round(pageWidth / A4_ASPECT)
    const contentHeight = pageHeight - A4_PADDING * 2
    setScaledDims({ width: pageWidth, height: pageHeight })

    const contentWidth = pageWidth - A4_PADDING * 2
    el.style.width = `${contentWidth}px`
    el.style.position = "absolute"
    el.style.visibility = "hidden"

    const blocks = previewHtml.split("\n")
    const pages: string[] = []
    let currentPage = ""

    for (let i = 0; i < blocks.length; i += 1) {
      const candidate = currentPage ? currentPage + "\n" + blocks[i] : blocks[i]
      el.innerHTML = `<div class="${RESUME_PREVIEW_CLASSES}">${candidate}</div>`

      if (el.scrollHeight > contentHeight && currentPage) {
        pages.push(currentPage)
        currentPage = blocks[i]
      } else {
        currentPage = candidate
      }
    }
    if (currentPage) pages.push(currentPage)

    setPreviewPages(pages.length ? pages : [""])
    el.innerHTML = ""
  }, [previewHtml, source])

  const focusSection = useCallback((index: number, line: number) => {
    editorApiRef.current?.focusLine(line)
    const pages = containerRef.current?.querySelectorAll("[data-preview-page] h2")
    const heading = pages?.[index]
    heading?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleExportPdf = async () => {
    if (exporting || !source.trim()) return
    setExporting(true)
    setExportFailed(false)
    const baseName = fileName.replace(/\.tex$/i, "") || "resume"
    const ok = await safeAsync(
      () => exportPreviewToPdf(previewHtml, `${baseName}.pdf`),
      { context: "ResumeCreator" }
    )
    setExporting(false)
    if (!ok) setExportFailed(true)
  }

  const handleSave = () => {
    const size = `${Math.max(1, Math.round(source.length / 1024))} KB`
    if (editing) {
      updateResume(editing.id, {
        name: fileName || editing.name,
        source,
        size,
        updated: "Just now",
      })
    } else {
      addResume({
        name: fileName || "My_Resume.tex",
        type: "TEX",
        size,
        updated: "Just now",
        source,
      })
    }
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([source], { type: "application/x-tex" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = fileName || "resume.tex"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const editorExtensions = useMemo(() => [StreamLanguage.define(stex)], [])

  const editableResumes = resumes.filter((r) => r.source)

  const startResize = (event: React.PointerEvent) => {
    event.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const aside = container.querySelector("aside")
    const asideWidth = aside ? aside.offsetWidth : 0
    const dividerWidth = 6
    const available = rect.width - asideWidth - dividerWidth
    const move = (e: PointerEvent) => {
      const x = e.clientX - rect.left - asideWidth - dividerWidth / 2
      const pct = (x / available) * 100
      setEditorPct(Math.min(70, Math.max(20, pct)))
    }
    const stop = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  const onDividerKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      setEditorPct((p) => Math.max(20, p - step))
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      setEditorPct((p) => Math.min(70, p + step))
    }
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col overflow-hidden rounded-xl bg-card shadow-sm">
      {/* 48px Toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-card/60 px-2.5 backdrop-blur">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          aria-label={messages.resume.back}
          onClick={() => navigate(ROUTES.documents)}
        >
          <icons.arrowLeft className="size-4" />
          <span className="hidden md:inline">{messages.resume.back}</span>
        </Button>

        <div className="flex items-center gap-1.5">
          <icons.brand className="size-4 text-primary" />
          <span className="text-sm font-semibold">{messages.resume.title}</span>
        </div>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          variant="outline"
          size="sm"
          className="h-8 max-w-44"
          onClick={() => setTemplatesOpen(true)}
        >
          <icons.templates className="size-3.5 shrink-0" />
          <span className="truncate">{activeTemplate?.name ?? messages.resume.template}</span>
          <icons.chevronDown className="size-3.5 shrink-0" />
        </Button>

        <span className="min-w-0 max-w-48 truncate font-mono text-xs text-muted-foreground">
          {fileName || messages.resume.fileNamePlaceholder}
        </span>

        <div className="ml-auto flex min-w-0 items-center gap-1">
          {exportFailed && (
            <span className="mr-1 hidden text-xs text-destructive sm:inline">
              {messages.resume.exportPdfFailed}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8"
                aria-label={messages.resume.openFromLibrary}
              >
                <icons.openFile className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>{messages.resume.librarySection}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {editableResumes.length === 0 ? (
                <DropdownMenuItem disabled>
                  {messages.resume.libraryEmpty}
                </DropdownMenuItem>
              ) : (
                editableResumes.map((resume) => (
                  <DropdownMenuItem key={resume.id} onSelect={() => loadResume(resume.id)}>
                    <icons.file className="size-3.5" />
                    <span className="truncate">{resume.name}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-3"
            disabled={exporting || !source.trim()}
            onClick={handleExportPdf}
          >
            {exporting ? (
              <icons.spinner className="size-4 animate-spin" />
            ) : (
              <icons.download className="size-4" />
            )}
            <span className="hidden sm:inline">{exporting ? messages.resume.exportingPdf : messages.resume.exportPdf}</span>
          </Button>
          <div className="h-5 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8"
            aria-label={messages.resume.download}
            onClick={handleDownload}
          >
            <icons.download className="size-4" />
          </Button>
          <Button
            variant={saved ? "outline" : "default"}
            size="sm"
            className="h-8 gap-1.5 px-3"
            onClick={handleSave}
          >
            {saved ? (
              <icons.check className="size-4 text-success" />
            ) : (
              <icons.save className="size-4" />
            )}
            {saved ? messages.resume.saved : messages.resume.save}
          </Button>
        </div>
      </div>

      {/* Body: outline + editor / divider / preview */}
      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row"
      >
        {/* Section outline */}
        <aside className="hidden min-h-0 w-52 shrink-0 flex-col overflow-y-auto border-r border-b lg:border-b-0 bg-muted/20 lg:flex">
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {messages.resume.sections}
            </p>
          </div>

          {sections.length === 0 ? (
            <p className="px-3 pb-2 text-xs text-muted-foreground">
              {messages.resume.noSections}
            </p>
          ) : (
            <nav className="space-y-0.5 px-2 pb-2">
              {sections.map((section, index) => (
                <button
                  key={`${section.line}-${index}`}
                  type="button"
                  onClick={() => focusSection(index, section.line)}
                  className="flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                >
                  <icons.chevronRight className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                  <span
                    className="min-w-0 flex-1 truncate"
                    dangerouslySetInnerHTML={{ __html: renderInline(section.title) }}
                  />
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* Editor pane */}
        <div
          className="flex min-h-0 min-w-0 flex-col"
          style={{ flexGrow: isLg ? editorPct : 1, flexBasis: isLg ? 0 : "50%" }}
        >
          <div className="flex h-9 shrink-0 items-center gap-2 border-b bg-muted/20 px-3">
            <icons.fileCode className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {messages.resume.editor}
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={source}
              extensions={editorExtensions}
              onChange={(value) => setSource(value)}
              apiRef={editorApiRef}
            />
          </div>
        </div>

        {/* Drag divider */}
        <div
          className={cn(
            "hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center transition-colors hover:bg-primary/10 lg:flex",
            "focus-visible:bg-primary/20 focus-visible:outline-none"
          )}
          role="separator"
          aria-orientation="vertical"
          aria-label={messages.resume.resizePanes}
          tabIndex={0}
          onPointerDown={startResize}
          onKeyDown={onDividerKeyDown}
        >
          <span className="h-8 w-0.5 rounded-full bg-border" />
        </div>

        {/* Preview pane */}
        <div
          className="flex min-h-0 min-w-0 flex-col"
          style={{ flexGrow: isLg ? 100 - editorPct : 1, flexBasis: isLg ? 0 : "50%" }}
        >
          <div className="flex h-9 shrink-0 items-center gap-2 border-b bg-muted/20 px-3">
            <icons.split className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {messages.resume.preview}
            </span>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-8 pt-8 pb-12" style={{ background: "linear-gradient(135deg, hsl(var(--muted) / 0.6), hsl(var(--muted) / 0.3))" }}>
            <div className="flex flex-col items-center gap-10">
              {source.trim() ? (
                <>
                  <div
                    ref={previewRef}
                    className={RESUME_PREVIEW_CLASSES}
                    aria-hidden
                    style={{ position: "absolute", visibility: "hidden", pointerEvents: "none" }}
                  />
                  {previewPages.map((pageHtml, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Page {i + 1} of {previewPages.length}
                      </span>
                      <div
                        data-preview-page
                        className="shrink-0 rounded-xl"
                        style={{
                          width: `${scaledDims.width}px`,
                          height: `${scaledDims.height}px`,
                          padding: `${A4_PADDING}px`,
                          overflow: "hidden",
                          background: "#fefefe",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.16), inset 0 0 0 1px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div
                          className={RESUME_PREVIEW_CLASSES}
                          dangerouslySetInnerHTML={{ __html: pageHtml }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="shrink-0 rounded-xl" style={{ width: `${scaledDims.width}px`, height: `${scaledDims.height}px`, padding: `${A4_PADDING}px`, overflow: "hidden", background: "#fefefe", boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.16), inset 0 0 0 1px rgba(0,0,0,0.04)" }}>
                  <p className="text-sm text-muted-foreground">
                    {messages.resume.previewEmpty}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TemplateManagerDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        activeTemplateId={templateId}
        onSelect={loadTemplate}
      />
    </div>
  )
}
