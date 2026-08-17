import { useState, useCallback, useMemo } from "react"

export type Folder = {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}

export type FolderItem = {
  id: string
  type: "page" | "folder"
  name: string
  parentId: string | null
  icon?: string
  favorite?: boolean
  updatedAt?: string
}

type FolderStore = {
  items: FolderItem[]
  createFolder: (name: string, parentId?: string | null) => FolderItem
  createPage: (title: string, parentId?: string | null) => FolderItem
  moveItem: (itemId: string, newParentId: string | null) => void
  renameItem: (itemId: string, newName: string) => void
  deleteItem: (itemId: string) => void
  getChildren: (parentId: string | null) => FolderItem[]
  getBreadcrumb: (itemId: string) => FolderItem[]
  toggleFavorite: (itemId: string) => void
  getItem: (itemId: string) => FolderItem | undefined
}

let idCounter = 1000

function newId(prefix: string): string {
  return `${prefix}-${++idCounter}-${Date.now()}`
}

export function useFolderStore(initialItems: FolderItem[] = []): FolderStore {
  const [items, setItems] = useState<FolderItem[]>(initialItems)

  const createFolder = useCallback(
    (name: string, parentId: string | null = null): FolderItem => {
      const folder: FolderItem = {
        id: newId("f"),
        type: "folder",
        name,
        parentId,
        icon: "openFile",
        updatedAt: "Just now",
      }
      setItems((prev) => [...prev, folder])
      return folder
    },
    []
  )

  const createPage = useCallback(
    (title: string, parentId: string | null = null): FolderItem => {
      const page: FolderItem = {
        id: newId("p"),
        type: "page",
        name: title,
        parentId,
        icon: "file",
        favorite: false,
        updatedAt: "Just now",
      }
      setItems((prev) => [...prev, page])
      return page
    },
    []
  )

  const moveItem = useCallback((itemId: string, newParentId: string | null) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, parentId: newParentId } : item
      )
    )
  }, [])

  const renameItem = useCallback((itemId: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, name: newName, updatedAt: "Just now" }
          : item
      )
    )
  }, [])

  const deleteItem = useCallback((itemId: string) => {
    setItems((prev) => {
      const collectDescendants = (parentId: string): string[] => {
        const children = prev.filter((i) => i.parentId === parentId)
        return [
          parentId,
          ...children.flatMap((c) => collectDescendants(c.id)),
        ]
      }
      const toDelete = new Set(collectDescendants(itemId))
      return prev.filter((i) => !toDelete.has(i.id))
    })
  }, [])

  const getChildren = useCallback(
    (parentId: string | null): FolderItem[] => {
      return items.filter((i) => i.parentId === parentId)
    },
    [items]
  )

  const getBreadcrumb = useCallback(
    (itemId: string): FolderItem[] => {
      const path: FolderItem[] = []
      let current = items.find((i) => i.id === itemId)
      while (current) {
        path.unshift(current)
        current = current.parentId
          ? items.find((i) => i.id === current!.parentId)
          : undefined
      }
      return path
    },
    [items]
  )

  const toggleFavorite = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, favorite: !item.favorite } : item
      )
    )
  }, [])

  const getItem = useCallback(
    (itemId: string): FolderItem | undefined => {
      return items.find((i) => i.id === itemId)
    },
    [items]
  )

  return useMemo(
    () => ({
      items,
      createFolder,
      createPage,
      moveItem,
      renameItem,
      deleteItem,
      getChildren,
      getBreadcrumb,
      toggleFavorite,
      getItem,
    }),
    [
      items,
      createFolder,
      createPage,
      moveItem,
      renameItem,
      deleteItem,
      getChildren,
      getBreadcrumb,
      toggleFavorite,
      getItem,
    ]
  )
}
