import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"

import { seededLibraryTemplates } from "@/data/documentTemplates"
import { uid } from "@/document-engine/history"
import type {
  DocDocument,
  DocElement,
  LibraryDocument,
  MyComponent,
} from "@/document-engine/types"

const DOCUMENTS_KEY = "dossier.documents.v1"
const COMPONENTS_KEY = "dossier.myComponents.v1"

function nowIso(): string {
  return new Date().toISOString()
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    /* ignore corrupt storage */
  }
  return fallback
}

interface DocumentLibraryValue {
  documents: LibraryDocument[]
  getDocument: (id: string) => LibraryDocument | undefined
  saveDocument: (doc: DocDocument) => LibraryDocument
  updateMeta: (
    id: string,
    patch: Partial<Pick<DocDocument, "name" | "description" | "category" | "author" | "version" | "status">>
  ) => void
  duplicateDocument: (id: string, name?: string) => LibraryDocument | undefined
  removeDocument: (id: string) => void
  addVersion: (
    id: string,
    version: string,
    note: string,
    snapshot: DocDocument
  ) => void
  components: MyComponent[]
  saveComponent: (name: string, elements: DocElement[]) => MyComponent
  removeComponent: (id: string) => void
  resetLibrary: () => void
}

const DocumentLibraryContext = createContext<DocumentLibraryValue | null>(null)

export function DocumentLibraryProvider({
  children,
}: {
  children: ReactNode
}) {
  const [documents, setDocuments] = useState<LibraryDocument[]>(() =>
    readStorage(DOCUMENTS_KEY, seededLibraryTemplates())
  )
  const [components, setComponents] = useState<MyComponent[]>(() =>
    readStorage(COMPONENTS_KEY, [])
  )

  useEffect(() => {
    try {
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents))
    } catch {
      /* storage full or unavailable */
    }
  }, [documents])

  useEffect(() => {
    try {
      localStorage.setItem(COMPONENTS_KEY, JSON.stringify(components))
    } catch {
      /* storage full or unavailable */
    }
  }, [components])

  const getDocument = useCallback(
    (id: string) => documents.find((doc) => doc.id === id),
    [documents]
  )

  const saveDocument = useCallback(
    (doc: DocDocument): LibraryDocument => {
      const existing = documents.find((item) => item.id === doc.id)
      const record: LibraryDocument = {
        ...doc,
        updatedAt: nowIso(),
        versions: existing?.versions ?? [],
      }
      setDocuments((prev) =>
        existing
          ? prev.map((item) => (item.id === doc.id ? record : item))
          : [record, ...prev]
      )
      return record
    },
    [documents]
  )

  const updateMeta: DocumentLibraryValue["updateMeta"] = useCallback(
    (id, patch) => {
      setDocuments((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...patch, updatedAt: nowIso() }
            : item
        )
      )
    },
    []
  )

  const duplicateDocument = useCallback(
    (id: string, name?: string) => {
      const source = documents.find((item) => item.id === id)
      if (!source) return undefined
      const copy = structuredClone(source)
      copy.id = uid()
      copy.name = name ?? `${source.name} (copy)`
      copy.createdAt = nowIso()
      copy.updatedAt = nowIso()
      copy.version = "1.0"
      copy.versions = []
      copy.status = "draft"
      setDocuments((prev) => [copy, ...prev])
      return copy
    },
    [documents]
  )

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addVersion: DocumentLibraryValue["addVersion"] = useCallback(
    (id, version, note, snapshot) => {
      setDocuments((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          const entry = {
            id: uid(),
            version,
            note,
            savedAt: nowIso(),
            snapshot: structuredClone(snapshot),
          }
          return {
            ...item,
            version,
            versions: [entry, ...item.versions].slice(0, 20),
          }
        })
      )
    },
    []
  )

  const saveComponent = useCallback((name: string, elements: DocElement[]) => {
    const component: MyComponent = {
      id: uid(),
      name,
      createdAt: nowIso(),
      elements: structuredClone(elements),
    }
    setComponents((prev) => [component, ...prev])
    return component
  }, [])

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const resetLibrary = useCallback(() => {
    const seeded = seededLibraryTemplates()
    setDocuments(seeded)
    setComponents([])
  }, [])

  const value = useMemo<DocumentLibraryValue>(
    () => ({
      documents,
      getDocument,
      saveDocument,
      updateMeta,
      duplicateDocument,
      removeDocument,
      addVersion,
      components,
      saveComponent,
      removeComponent,
      resetLibrary,
    }),
    [
      documents,
      components,
      getDocument,
      saveDocument,
      updateMeta,
      duplicateDocument,
      removeDocument,
      addVersion,
      saveComponent,
      removeComponent,
      resetLibrary,
    ]
  )

  return (
    <DocumentLibraryContext.Provider value={value}>
      {children}
    </DocumentLibraryContext.Provider>
  )
}

export function useDocumentLibrary(): DocumentLibraryValue {
  const context = useContext(DocumentLibraryContext)
  if (!context) {
    throw new Error(
      "useDocumentLibrary must be used within a DocumentLibraryProvider"
    )
  }
  return context
}
