import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  pages as initialPages,
  workspaces as initialWorkspaces,
  type PageEntry,
  type WorkspaceEntry,
} from "@/data/pages"

type PagesValue = {
  workspaces: WorkspaceEntry[]
  currentWorkspace: WorkspaceEntry
  setCurrentWorkspace: (id: string) => void
  pages: PageEntry[]
  rootPages: PageEntry[]
  getChildPages: (parentId: string) => PageEntry[]
  getPage: (id: string) => PageEntry | undefined
  updatePage: (id: string, updates: Partial<Pick<PageEntry, "title" | "content" | "icon" | "favorite">>) => void
  addPage: (title: string, parentId?: string | null) => PageEntry
  deletePage: (id: string) => void
}

const PagesContext = createContext<PagesValue | null>(null)

let pageCounter = 100

export function PagesProvider({ children }: { children: ReactNode }) {
  const [workspaces] = useState<WorkspaceEntry[]>(initialWorkspaces)
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState("ws-1")
  const [allPages, setAllPages] = useState<PageEntry[]>(initialPages)

  const currentWorkspace = useMemo(
    () => workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0],
    [workspaces, currentWorkspaceId]
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
            ? { ...p, ...updates, updatedAt: "Just now" }
            : p
        )
      )
    },
    []
  )

  const addPage = useCallback(
    (title: string, parentId: string | null = null) => {
      const id = `p-${++pageCounter}`
      const newPage: PageEntry = {
        id,
        title,
        icon: "📄",
        content: `# ${title}\n\nStart writing here...`,
        parentId,
        children: [],
        workspaceId: currentWorkspaceId,
        createdAt: "Just now",
        updatedAt: "Just now",
        favorite: false,
      }
      setAllPages((prev) => {
        const updated = parentId
          ? prev.map((p) =>
              p.id === parentId ? { ...p, children: [...p.children, id] } : p
            )
          : prev
        return [...updated, newPage]
      })
      return newPage
    },
    [currentWorkspaceId]
  )

  const deletePage = useCallback((id: string) => {
    setAllPages((prev) => {
      const target = prev.find((p) => p.id === id)
      if (!target) return prev
      let updated = prev.filter((p) => p.id !== id && p.parentId !== id)
      if (target.parentId) {
        updated = updated.map((p) =>
          p.id === target.parentId
            ? { ...p, children: p.children.filter((c) => c !== id) }
            : p
        )
      }
      return updated
    })
  }, [])

  const value = useMemo<PagesValue>(
    () => ({
      workspaces,
      currentWorkspace,
      setCurrentWorkspace: setCurrentWorkspaceId,
      pages,
      rootPages,
      getChildPages,
      getPage,
      updatePage,
      addPage,
      deletePage,
    }),
    [workspaces, currentWorkspace, pages, rootPages, getChildPages, getPage, updatePage, addPage, deletePage]
  )

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>
}

export function usePages(): PagesValue {
  const ctx = useContext(PagesContext)
  if (!ctx) throw new Error("usePages must be used within PagesProvider")
  return ctx
}
