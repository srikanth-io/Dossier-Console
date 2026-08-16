import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StreamLanguage } from "@codemirror/language"
import { stex } from "@codemirror/legacy-modes/mode/stex"

import { CodeEditor, type CodeEditorApi } from "@/components/code-editor"
import { TemplateManagerDialog } from "@/components/template-manager-dialog"
import { Badge } from "@/components/ui/badge"
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
import { useResumeLibrary } from "@/store/resumes"

export function ResumeCreator() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get("edit")
  const templateParam = searchParams.get("template")
  const { resumes, addResume, updateResume } = useResumeLibrary()

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

  const focusSection = useCallback((index: number, line: number) => {
    editorApiRef.current?.focusLine(line)
    const root = previewRef.current
    if (!root) return
    const heading = root.querySelectorAll("h2")[index]
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

  return (
    <div className="flex h-[calc(100svh-6.5rem)] flex-col overflow-hidden rounded-xl bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-foreground/5 bg-brand-accent-soft px-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={messages.resume.back}
          onClick={() => navigate(ROUTES.documents)}
        >
          <icons.chevronLeft />
        </Button>
        <div className="flex items-center gap-2">
          <icons.brand className="size-4 text-primary" />
          <span className="text-sm font-semibold">{messages.resume.title}</span>
        </div>

        <div className="mx-2 h-5 w-px bg-foreground/10" />

        <span className="truncate font-mono text-xs text-muted-foreground">
          {fileName || messages.resume.fileNamePlaceholder}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {exportFailed && (
            <span className="mr-1 text-xs text-destructive">
              {messages.resume.exportPdfFailed}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={messages.resume.openFromLibrary}
              >
                <icons.openFile />
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
            variant="ghost"
            size="icon-sm"
            aria-label={messages.templates.managerTitle}
            onClick={() => setTemplatesOpen(true)}
          >
            <icons.templates />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting || !source.trim()}
            onClick={handleExportPdf}
          >
            {exporting ? (
              <icons.spinner className="animate-spin" />
            ) : (
              <icons.download />
            )}
            {exporting ? messages.resume.exportingPdf : messages.resume.exportPdf}
          </Button>
          <div className="mx-1 h-5 w-px bg-foreground/10" />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={messages.resume.download}
            onClick={handleDownload}
          >
            <icons.download />
          </Button>
          <Button onClick={handleSave} size="sm">
            {saved ? <icons.check /> : <icons.save />}
            {saved ? messages.resume.saved : messages.resume.save}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Section outline */}
        <div className="flex w-52 shrink-0 flex-col overflow-y-auto border-r border-foreground/5 bg-muted/20">
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
        </div>

        {/* Editor */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-foreground/5 bg-muted/20 px-3">
            <icons.fileCode className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {messages.resume.editor}
            </span>
            <Badge
              variant="secondary"
              className="ml-auto font-mono text-[10px]"
            >
              .tex
            </Badge>
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

        {/* Preview */}
        <div className="flex min-w-0 flex-1 flex-col border-l border-foreground/5">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-foreground/5 bg-muted/20 px-3">
            <icons.split className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {messages.resume.preview}
            </span>
            <Badge
              variant="secondary"
              className="ml-auto font-mono text-[10px]"
            >
              A4
            </Badge>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-y-auto bg-muted/30 p-4">
            <div className="h-fit w-full max-w-[595px] bg-popover p-8 shadow-sm">
              {source.trim() ? (
                <div
                  ref={previewRef}
                  className={RESUME_PREVIEW_CLASSES}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {messages.resume.previewEmpty}
                </p>
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
