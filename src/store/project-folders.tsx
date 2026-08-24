import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { useAuth } from "@/store/auth"

export type FolderPermission = "viewer" | "editor"

export type ProjectFolder = {
  id: string
  projectId: string
  name: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export type FolderShare = {
  id: string
  folderId: string
  colleagueId: string
  permission: FolderPermission
  sharedAt: string
}

type ProjectFoldersValue = {
  folders: ProjectFolder[]
  shares: FolderShare[]
  getProjectFolders: (projectId: string) => ProjectFolder[]
  getChildFolders: (projectId: string, parentId: string | null) => ProjectFolder[]
  getFolder: (id: string) => ProjectFolder | undefined
  getTrail: (folderId: string) => ProjectFolder[]
  getSubfolderCount: (folderId: string) => number
  getFolderShares: (folderId: string) => FolderShare[]
  createFolder: (
    projectId: string,
    name: string,
    parentId?: string | null
  ) => ProjectFolder
  renameFolder: (id: string, name: string) => void
  deleteFolder: (id: string) => void
  shareFolder: (
    folderId: string,
    colleagueId: string,
    permission: FolderPermission
  ) => boolean
  updateSharePermission: (shareId: string, permission: FolderPermission) => void
  revokeShare: (shareId: string) => void
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const now = () => new Date().toISOString()

const ProjectFoldersContext = createContext<ProjectFoldersValue | null>(null)

/** Folders belong to a project; sharing grants colleagues viewer or editor access. */
export function ProjectFoldersProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const authenticated = status === "authenticated"

  const [folders, setFolders] = useState<ProjectFolder[]>([])
  const [shares, setShares] = useState<FolderShare[]>([])

  useEffect(() => {
    if (!authenticated) {
      setFolders([])
      setShares([])
    }
  }, [authenticated])

  const collectDescendantIds = useCallback(
    (folderId: string, all: ProjectFolder[]): Set<string> => {
      const ids = new Set<string>([folderId])
      let frontier = [folderId]
      while (frontier.length > 0) {
        const next: string[] = []
        for (const id of frontier) {
          for (const child of all) {
            if (child.parentId === id && !ids.has(child.id)) {
              ids.add(child.id)
              next.push(child.id)
            }
          }
        }
        frontier = next
      }
      return ids
    },
    []
  )

  const getProjectFolders = useCallback(
    (projectId: string) => folders.filter((f) => f.projectId === projectId),
    [folders]
  )

  const getChildFolders = useCallback(
    (projectId: string, parentId: string | null) =>
      folders.filter((f) => f.projectId === projectId && f.parentId === parentId),
    [folders]
  )

  const getFolder = useCallback(
    (id: string) => folders.find((f) => f.id === id),
    [folders]
  )

  const getTrail = useCallback(
    (folderId: string) => {
      const trail: ProjectFolder[] = []
      let cursor = folders.find((f) => f.id === folderId)
      while (cursor) {
        const current = cursor
        trail.unshift(current)
        cursor = current.parentId
          ? folders.find((f) => f.id === current.parentId)
          : undefined
      }
      return trail
    },
    [folders]
  )

  const getSubfolderCount = useCallback(
    (folderId: string) => folders.filter((f) => f.parentId === folderId).length,
    [folders]
  )

  const getFolderShares = useCallback(
    (folderId: string) => shares.filter((s) => s.folderId === folderId),
    [shares]
  )

  const createFolder = useCallback(
    (projectId: string, name: string, parentId: string | null = null) => {
      const timestamp = now()
      const folder: ProjectFolder = {
        id: uid(),
        projectId,
        name,
        parentId,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      setFolders((prev) => [...prev, folder])
      return folder
    },
    []
  )

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name, updatedAt: now() } : f))
    )
  }, [])

  const deleteFolder = useCallback(
    (id: string) => {
      setFolders((prev) => {
        const doomed = collectDescendantIds(id, prev)
        return prev.filter((f) => !doomed.has(f.id))
      })
      setShares((prev) => prev.filter((s) => s.folderId !== id))
    },
    [collectDescendantIds]
  )

  const shareFolder = useCallback(
    (folderId: string, colleagueId: string, permission: FolderPermission) => {
      let created = false
      setShares((prev) => {
        if (prev.some((s) => s.folderId === folderId && s.colleagueId === colleagueId)) {
          return prev
        }
        created = true
        return [
          ...prev,
          { id: uid(), folderId, colleagueId, permission, sharedAt: now() },
        ]
      })
      return created
    },
    []
  )

  const updateSharePermission = useCallback(
    (shareId: string, permission: FolderPermission) => {
      setShares((prev) =>
        prev.map((s) => (s.id === shareId ? { ...s, permission } : s))
      )
    },
    []
  )

  const revokeShare = useCallback((shareId: string) => {
    setShares((prev) => prev.filter((s) => s.id !== shareId))
  }, [])

  const value = useMemo<ProjectFoldersValue>(
    () => ({
      folders,
      shares,
      getProjectFolders,
      getChildFolders,
      getFolder,
      getTrail,
      getSubfolderCount,
      getFolderShares,
      createFolder,
      renameFolder,
      deleteFolder,
      shareFolder,
      updateSharePermission,
      revokeShare,
    }),
    [
      folders,
      shares,
      getProjectFolders,
      getChildFolders,
      getFolder,
      getTrail,
      getSubfolderCount,
      getFolderShares,
      createFolder,
      renameFolder,
      deleteFolder,
      shareFolder,
      updateSharePermission,
      revokeShare,
    ]
  )

  return (
    <ProjectFoldersContext.Provider value={value}>
      {children}
    </ProjectFoldersContext.Provider>
  )
}

export function useProjectFolders(): ProjectFoldersValue {
  const context = useContext(ProjectFoldersContext)
  if (!context) {
    throw new Error("useProjectFolders must be used within ProjectFoldersProvider")
  }
  return context
}
