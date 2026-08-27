import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"

import { errorCodes } from "@/constants/messages/errors"
import { uid } from "@/document-engine/history"
import type {
  DocDocument,
  DocElement,
  LibraryDocument,
  MyComponent,
} from "@/document-engine/types"
import { AppError } from "@/lib/errors"
import { getSupabase } from "@/lib/supabase"
import { safeAsync } from "@/lib/async"
import { persistOrQueue } from "@/lib/mutation-queue"
import { useAuth } from "@/store/auth"

function nowIso(): string {
  return new Date().toISOString()
}

type DocumentRow = {
  id: string
  user_id: string
  project_id: string | null
  name: string
  description: string
  category: string
  status: string
  version: string
  author: string
  data: LibraryDocument
  created_at: string
  updated_at: string
}

type ComponentRow = {
  id: string
  user_id: string
  name: string
  elements: DocElement[]
  created_at: string
}

interface DocumentLibraryValue {
  documents: LibraryDocument[]
  loading: boolean
  getDocument: (id: string) => LibraryDocument | undefined
  getDocumentsByProject: (projectId: string) => LibraryDocument[]
  saveDocument: (doc: DocDocument, projectId?: string) => LibraryDocument
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

function documentRow(record: LibraryDocument) {
  return {
    id: record.id,
    project_id: record.projectId ?? null,
    name: record.name,
    description: record.description,
    category: record.category,
    status: record.status,
    version: record.version,
    author: record.author,
    data: record,
  }
}

export function DocumentLibraryProvider({
  children,
}: {
  children: ReactNode
}) {
  const { status } = useAuth()
  const authenticated = status === "authenticated"

  const [documents, setDocuments] = useState<LibraryDocument[]>([])
  const [components, setComponents] = useState<MyComponent[]>([])
  const [loading, setLoading] = useState(false)

  // Hydrate the signed-in user's library straight from Postgres. RLS scopes
  // every row to auth.uid(), so no other account's data can ever appear.
  useEffect(() => {
    if (!authenticated) {
      setDocuments([])
      setComponents([])
      return
    }

    let cancelled = false
    setLoading(true)

    void safeAsync(async () => {
      const client = getSupabase()
      const [docs, comps] = await Promise.all([
        client
          .from("documents")
          .select("*")
          .order("updated_at", { ascending: false }),
        client
          .from("document_components")
          .select("*")
          .order("created_at", { ascending: false }),
      ])

      if (docs.error) {
        throw new AppError(errorCodes.dataLoadFailed, docs.error.message)
      }
      if (comps.error) {
        throw new AppError(errorCodes.dataLoadFailed, comps.error.message)
      }

      if (!cancelled) {
        setDocuments(((docs.data ?? []) as DocumentRow[]).map((row) => ({
          ...row.data,
          projectId: row.project_id ?? undefined,
        })))
        setComponents(
          ((comps.data ?? []) as ComponentRow[]).map((row) => ({
            id: row.id,
            name: row.name,
            createdAt: row.created_at,
            elements: row.elements ?? [],
          }))
        )
      }
    }, { context: "DocumentLibrary.load" }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [authenticated])

  const getDocument = useCallback(
    (id: string) => documents.find((doc) => doc.id === id),
    [documents]
  )

  const getDocumentsByProject = useCallback(
    (projectId: string) => documents.filter((doc) => doc.projectId === projectId),
    [documents]
  )

  const saveDocument = useCallback(
    (doc: DocDocument, projectId?: string): LibraryDocument => {
      const existing = documents.find((item) => item.id === doc.id)
      const record: LibraryDocument = {
        ...doc,
        projectId: projectId ?? existing?.projectId,
        updatedAt: nowIso(),
        versions: existing?.versions ?? [],
      }
      setDocuments((prev) =>
        existing
          ? prev.map((item) => (item.id === doc.id ? record : item))
          : [record, ...prev]
      )

      void safeAsync(async () => {
        await persistOrQueue(
          { kind: "upsert", table: "documents", row: documentRow(record), context: "DocumentLibrary.saveDocument" },
          () => getSupabase().from("documents").upsert(documentRow(record))
        )
      }, { context: "DocumentLibrary.saveDocument" })

      return record
    },
    [documents]
  )

  const updateMeta: DocumentLibraryValue["updateMeta"] = useCallback(
    (id, patch) => {
      const stamp = nowIso()
      let next: LibraryDocument | undefined
      setDocuments((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          next = { ...item, ...patch, updatedAt: stamp }
          return next
        })
      )

      if (next) {
        const record = next
        void safeAsync(async () => {
          await persistOrQueue(
            { kind: "upsert", table: "documents", row: documentRow(record), context: "DocumentLibrary.updateMeta" },
            () => getSupabase().from("documents").update(documentRow(record)).eq("id", id)
          )
        }, { context: "DocumentLibrary.updateMeta" })
      }
    },
    []
  )

  const duplicateDocument = useCallback(
    (id: string, name?: string) => {
      const source = documents.find((item) => item.id === id)
      if (!source) return undefined
      const copy: LibraryDocument = structuredClone(source)
      copy.id = uid()
      copy.name = name ?? `${source.name} (copy)`
      copy.createdAt = nowIso()
      copy.updatedAt = nowIso()
      copy.version = "1.0"
      copy.versions = []
      copy.status = "draft"
      setDocuments((prev) => [copy, ...prev])

      void safeAsync(async () => {
        await persistOrQueue(
          { kind: "upsert", table: "documents", row: documentRow(copy), context: "DocumentLibrary.duplicateDocument" },
          () => getSupabase().from("documents").upsert(documentRow(copy))
        )
      }, { context: "DocumentLibrary.duplicateDocument" })

      return copy
    },
    [documents]
  )

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((item) => item.id !== id))

    void safeAsync(async () => {
      await persistOrQueue(
        { kind: "delete", table: "documents", column: "id", value: id, context: "DocumentLibrary.removeDocument" },
        () => getSupabase().from("documents").delete().eq("id", id)
      )
    }, { context: "DocumentLibrary.removeDocument" })
  }, [])

  const addVersion: DocumentLibraryValue["addVersion"] = useCallback(
    (id, version, note, snapshot) => {
      const entry = {
        id: uid(),
        version,
        note,
        savedAt: nowIso(),
        snapshot: structuredClone(snapshot),
      }
      let next: LibraryDocument | undefined
      setDocuments((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          next = {
            ...item,
            version,
            versions: [entry, ...item.versions].slice(0, 20),
          }
          return next
        })
      )

      if (next) {
        const record = next
        void safeAsync(async () => {
          await persistOrQueue(
            { kind: "upsert", table: "documents", row: documentRow(record), context: "DocumentLibrary.addVersion" },
            () => getSupabase().from("documents").update(documentRow(record)).eq("id", id)
          )
        }, { context: "DocumentLibrary.addVersion" })
      }
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

    void safeAsync(async () => {
      await persistOrQueue(
        {
          kind: "upsert",
          table: "document_components",
          row: { id: component.id, name: component.name, elements: component.elements },
          context: "DocumentLibrary.saveComponent",
        },
        () =>
          getSupabase().from("document_components").upsert({
            id: component.id,
            name: component.name,
            elements: component.elements,
          })
      )
    }, { context: "DocumentLibrary.saveComponent" })

    return component
  }, [])

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((item) => item.id !== id))

    void safeAsync(async () => {
      await persistOrQueue(
        { kind: "delete", table: "document_components", column: "id", value: id, context: "DocumentLibrary.removeComponent" },
        () => getSupabase().from("document_components").delete().eq("id", id)
      )
    }, { context: "DocumentLibrary.removeComponent" })
  }, [])

  const resetLibrary = useCallback(() => {
    setDocuments([])
    setComponents([])

    void safeAsync(async () => {
      const client = getSupabase()
      await Promise.all([
        client.from("documents").delete().neq("id", ""),
        client.from("document_components").delete().neq("id", ""),
      ])
    }, { context: "DocumentLibrary.resetLibrary" })
  }, [])

  const value = useMemo<DocumentLibraryValue>(
    () => ({
      documents,
      loading,
      getDocument,
      getDocumentsByProject,
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
      loading,
      getDocument,
      getDocumentsByProject,
      saveDocument,
      updateMeta,
      duplicateDocument,
      removeDocument,
      addVersion,
      components,
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
