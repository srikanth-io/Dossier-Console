import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { errorCodes } from "@/constants/messages/errors"
import { AppError } from "@/lib/errors"
import { formatRelative } from "@/lib/time"
import { getSupabase } from "@/lib/supabase"
import { safeAsync } from "@/lib/async"
import { persistOrQueue } from "@/lib/mutation-queue"
import { useAuth } from "@/store/auth"

export type PageKind = "note" | "folder"

export type PageEntry = {
  id: string
  title: string
  icon: string
  content: string
  parentId: string | null
  children: string[]
  workspaceId: string
  createdAt: string
  updatedAt: string
  favorite: boolean
  kind: PageKind
}

export type WorkspaceEntry = {
  id: string
  name: string
  icon: string
  pageCount: number
}

/** Product scaffolding - a single personal workspace per account. */
const DEFAULT_WORKSPACE_ID = "personal"

type PageRow = {
  id: string
  user_id: string
  workspace_id: string
  parent_id: string | null
  title: string
  icon: string
  content: string
  favorite: boolean
  kind: string
  position: number
  created_at: string
  updated_at: string
}

function rowToPage(row: PageRow): PageEntry {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    content: row.content,
    parentId: row.parent_id,
    children: [],
    workspaceId: row.workspace_id,
    createdAt: formatRelative(row.created_at),
    updatedAt: formatRelative(row.updated_at),
    favorite: row.favorite,
    kind: row.kind === "folder" ? "folder" : "note",
  }
}

function withChildren(pages: PageEntry[]): PageEntry[] {
  return pages.map((page) => ({
    ...page,
    children: pages
      .filter((p) => p.parentId === page.id)
      .map((child) => child.id),
  }))
}

type PagesValue = {
  workspaces: WorkspaceEntry[]
  currentWorkspace: WorkspaceEntry
  setCurrentWorkspace: (id: string) => void
  loading: boolean
  pages: PageEntry[]
  rootPages: PageEntry[]
  getChildPages: (parentId: string) => PageEntry[]
  getPage: (id: string) => PageEntry | undefined
  updatePage: (id: string, updates: Partial<Pick<PageEntry, "title" | "content" | "icon" | "favorite">>) => void
  addPage: (title: string, options?: { parentId?: string | null; kind?: PageKind }) => PageEntry
  deletePage: (id: string) => void
}

const PagesContext = createContext<PagesValue | null>(null)

const fallbackWorkspace: WorkspaceEntry = {
  id: DEFAULT_WORKSPACE_ID,
  name: "Personal",
  icon: "P",
  pageCount: 0,
}

export function PagesProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const authenticated = status === "authenticated"

  const [allPages, setAllPages] = useState<PageEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authenticated) {
      setAllPages([])
      return
    }

    let cancelled = false
    setLoading(true)

    void safeAsync(async () => {
      const { data, error } = await getSupabase()
        .from("notepad_pages")
        .select("*")
        .order("created_at", { ascending: true })
      if (error) throw new AppError(errorCodes.dataLoadFailed, error.message)
      if (!cancelled) setAllPages(withChildren(((data ?? []) as PageRow[]).map(rowToPage)))
    }, { context: "Pages.load" }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [authenticated])

  const currentWorkspaceId = DEFAULT_WORKSPACE_ID

  const currentWorkspace = useMemo<WorkspaceEntry>(
    () => ({
      ...fallbackWorkspace,
      pageCount: allPages.filter((p) => p.workspaceId === currentWorkspaceId).length,
    }),
    [allPages, currentWorkspaceId]
  )

  const pages = useMemo(
    () => allPages.filter((p) => p.workspaceId === currentWorkspaceId),
    [allPages, currentWorkspaceId]
  )

  const rootPages = useMemo(
    () => pages.filter((p) => p.parentId === null),
    [pages]
  )

  const getChildPages = useCallback(
    (parentId: string) => pages.filter((p) => p.parentId === parentId),
    [pages]
  )

  const getPage = useCallback(
    (id: string) => allPages.find((p) => p.id === id),
    [allPages]
  )

  const updatePage = useCallback(
    (id: string, updates: Partial<Pick<PageEntry, "title" | "content" | "icon" | "favorite">>) => {
      setAllPages((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: formatRelative(new Date().toISOString()) }
            : p
        )
      )

      void safeAsync(async () => {
        const row = { id, ...updates }
        await persistOrQueue(
          { kind: "upsert", table: "notepad_pages", row, context: "Pages.updatePage" },
          () => getSupabase().from("notepad_pages").update(row).eq("id", id)
        )
      }, { context: "Pages.updatePage" })
    },
    []
  )

  const addPage = useCallback(
    (title: string, options?: { parentId?: string | null; kind?: PageKind }) => {
      const parentId = options?.parentId ?? null
      const kind: PageKind = options?.kind ?? "note"
      const now = new Date().toISOString()
      const newPage: PageEntry = {
        id: crypto.randomUUID(),
        title,
        icon: kind === "folder" ? "dossiers" : "file",
        content: `# ${title}\n\nStart writing here...`,
        parentId,
        children: [],
        workspaceId: currentWorkspaceId,
        createdAt: formatRelative(now),
        updatedAt: formatRelative(now),
        favorite: false,
        kind,
      }
      setAllPages((prev) =>
        withChildren([
          ...prev.map((p) =>
            p.id === parentId ? { ...p, children: [...p.children, newPage.id] } : p
          ),
          newPage,
        ])
      )

      void safeAsync(async () => {
        const row = {
          id: newPage.id,
          workspace_id: newPage.workspaceId,
          parent_id: parentId,
          title: newPage.title,
          icon: newPage.icon,
          content: newPage.content,
          kind,
        }
        await persistOrQueue(
          { kind: "upsert", table: "notepad_pages", row, context: "Pages.addPage" },
          () => getSupabase().from("notepad_pages").upsert(row)
        )
      }, { context: "Pages.addPage" })

      return newPage
    },
    [currentWorkspaceId]
  )

  const deletePage = useCallback((id: string) => {
    // Children are removed too; the DB cascade mirrors this locally.
    let removedIds = new Set<string>()
    setAllPages((prev) => {
      const target = prev.find((p) => p.id === id)
      if (!target) return prev

      const collect = (pid: string, acc: Set<string>): Set<string> => {
        acc.add(pid)
        for (const child of prev.filter((p) => p.parentId === pid)) {
          collect(child.id, acc)
        }
        return acc
      }
      removedIds = collect(id, new Set())

      return prev
        .filter((p) => !removedIds.has(p.id))
        .map((p) =>
          p.id === target.parentId
            ? { ...p, children: p.children.filter((c) => c !== id) }
            : p
        )
    })

    void safeAsync(async () => {
      await persistOrQueue(
        { kind: "delete", table: "notepad_pages", column: "id", value: id, context: "Pages.deletePage" },
        () => getSupabase().from("notepad_pages").delete().eq("id", id)
      )
    }, { context: "Pages.deletePage" })
  }, [])

  const value = useMemo<PagesValue>(
    () => ({
      workspaces: [currentWorkspace],
      currentWorkspace,
      setCurrentWorkspace: () => {},
      loading,
      pages,
      rootPages,
      getChildPages,
      getPage,
      updatePage,
      addPage,
      deletePage,
    }),
    [currentWorkspace, loading, pages, rootPages, getChildPages, getPage, updatePage, addPage, deletePage]
  )

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>
}

export function usePages(): PagesValue {
  const ctx = useContext(PagesContext)
  if (!ctx) throw new Error("usePages must be used within PagesProvider")
  return ctx
}
