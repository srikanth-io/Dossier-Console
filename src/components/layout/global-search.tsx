import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { commonMessages, ROUTES, icons, messages } from "@/constants"
import { cn } from "@/lib/utils"
import { useProjects } from "@/store/projects"
import { useProjectFolders } from "@/store/project-folders"
import { useDocumentLibrary } from "@/store/documents"
import { usePages } from "@/store/pages"
import { useResumeLibrary } from "@/store/resumes"

type SearchResult = {
  id: string
  label: string
  hint?: string
  group: keyof typeof messages.layout.searchGroups
  icon: (typeof icons)[keyof typeof icons]
  to: string
  state?: Record<string, unknown>
}

type GroupedResults = {
  group: keyof typeof messages.layout.searchGroups
  label: string
  items: SearchResult[]
}

const staticResults: SearchResult[] = [
  { id: "page-dashboard", label: messages.nav.items.dashboard, group: "pages", icon: icons.dashboard, to: ROUTES.dashboard },
  { id: "page-projects", label: messages.nav.items.projects, group: "pages", icon: icons.dossiers, to: ROUTES.projects },
  { id: "page-resumes", label: "Resume Manager", group: "resumes", icon: icons.openFile, to: ROUTES.resumes },
  { id: "page-builder", label: "Resume Builder", group: "resumes", icon: icons.fileCode, to: ROUTES.resumeBuilder },
]

const settingsResults: SearchResult[] = [
  { id: "settings-account", label: messages.settings.nav.account, group: "settings", icon: icons.user, to: ROUTES.settings, state: { section: "account" } },
  { id: "settings-appearance", label: messages.settings.nav.appearance, group: "settings", icon: icons.sun, to: ROUTES.settings, state: { section: "appearance" } },
  { id: "settings-workspace", label: messages.settings.workspace.title, group: "settings", icon: icons.dossiers, to: ROUTES.settings, state: { section: "workspace" } },
  { id: "settings-notifications", label: messages.settings.nav.notifications, group: "settings", icon: icons.notifications, to: ROUTES.settings, state: { section: "notifications" } },
  { id: "settings-security", label: messages.settings.nav.security, group: "settings", icon: icons.lock, to: ROUTES.settings, state: { section: "security" } },
  { id: "settings-devices", label: messages.settings.nav.devices, group: "settings", icon: icons.apple, to: ROUTES.settings, state: { section: "devices" } },
  { id: "settings-monitoring", label: messages.settings.nav.monitoring, group: "settings", icon: icons.activity, to: ROUTES.settings, state: { section: "monitoring" } },
  { id: "settings-billing", label: messages.settings.nav.billing, group: "settings", icon: icons.reports, to: ROUTES.settings, state: { section: "billing" } },
  { id: "settings-dangerZone", label: messages.settings.nav.dangerZone, group: "settings", icon: icons.alertCircle, to: ROUTES.settings, state: { section: "dangerZone" } },
]

const GROUP_ORDER = [
  "pages",
  "projects",
  "folders",
  "documents",
  "notes",
  "resumes",
  "settings",
] as const

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { projects } = useProjects()
  const { getProjectFolders } = useProjectFolders()
  const { documents } = useDocumentLibrary()
  const { pages } = usePages()
  const { resumes } = useResumeLibrary()

  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setHighlight(0)
    }
  }, [open])

  const dataResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = []

    for (const project of projects) {
      results.push({
        id: `project-${project.id}`,
        label: project.name,
        hint: `${project.ref} · ${project.client}`,
        group: "projects",
        icon: icons.dossiers,
        to: `/app/projects/${project.id}`,
      })
    }

    for (const project of projects) {
      for (const folder of getProjectFolders(project.id)) {
        results.push({
          id: `folder-${folder.id}`,
          label: folder.name,
          hint: project.name,
          group: "folders",
          icon: icons.openFile,
          to: `/app/projects/${project.id}`,
          state: { folderId: folder.id },
        })
      }
    }

    for (const doc of documents) {
      results.push({
        id: `document-${doc.id}`,
        label: doc.name,
        hint: doc.category,
        group: "documents",
        icon: icons.openFile,
        to: doc.projectId ? `/app/projects/${doc.projectId}/documents/${doc.id}` : ROUTES.resumes,
      })
    }

    for (const entry of pages) {
      if (entry.kind !== "note") continue
      results.push({
        id: `note-${entry.id}`,
        label: entry.title || commonMessages.none,
        group: "notes",
        icon: icons.file,
        to: entry.projectId ? `/app/projects/${entry.projectId}/notes/${entry.id}` : ROUTES.projects,
      })
    }

    for (const resume of resumes) {
      results.push({
        id: `resume-${resume.id}`,
        label: resume.name,
        hint: resume.type,
        group: "resumes",
        icon: icons.fileCode,
        to: ROUTES.resumes,
      })
    }

    return results
  }, [projects, getProjectFolders, documents, pages, resumes])

  const grouped = useMemo<GroupedResults[]>(() => {
    const q = query.trim().toLowerCase()
    const pool =
      q.length === 0
        ? [...staticResults, ...settingsResults]
        : [...staticResults, ...dataResults, ...settingsResults]

    const filtered = pool.filter(
      (item) =>
        q.length === 0 ||
        item.label.toLowerCase().includes(q) ||
        (item.hint ?? "").toLowerCase().includes(q)
    )

    return GROUP_ORDER.map((group) => ({
      group,
      label: messages.layout.searchGroups[group],
      items: filtered.filter((item) => item.group === group),
    })).filter((group) => group.items.length > 0)
  }, [query, dataResults])

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  useEffect(() => {
    setHighlight(0)
  }, [query])

  useEffect(() => {
    const active = flat[highlight]
    if (!active || !listRef.current) return
    const el = listRef.current.querySelector(`[data-result-id="${active.id}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [highlight, flat])

  const select = (item: SearchResult) => {
    onOpenChange(false)
    navigate(item.to, item.state ? { state: item.state } : undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, flat.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = flat[highlight]
      if (item) select(item)
    }
  }

  let runningIndex = -1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{messages.layout.searchPlaceholder}</DialogTitle>
          <DialogDescription>{messages.layout.searchPlaceholder}</DialogDescription>
        </DialogHeader>
        <div className="border-b border-border/60">
          <div className="relative">
            <icons.search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={messages.layout.searchPlaceholder}
              className="h-12 rounded-none border-0 bg-transparent pr-4 pl-10 text-sm shadow-none focus-visible:ring-0"
              aria-label={messages.layout.searchPlaceholder}
            />
          </div>
        </div>
        <div ref={listRef} className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
          {flat.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {messages.layout.searchNoResults}
            </p>
          )}
          {grouped.map((group) => (
            <div key={group.group} className="mb-1 last:mb-0">
              <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {group.label}
              </p>
              {group.items.map((item) => {
                runningIndex += 1
                const index = runningIndex
                const Icon = item.icon
                const active = index === highlight
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-result-id={item.id}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => select(item)}
                    aria-current={active}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                      active ? "bg-primary-soft text-primary dark:bg-primary/15" : "hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
                    {item.hint && (
                      <span className="max-w-[40%] truncate text-xs text-muted-foreground">
                        {item.hint}
                      </span>
                    )}
                    {active && <icons.chevronRight className="size-3.5 shrink-0 opacity-50" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
