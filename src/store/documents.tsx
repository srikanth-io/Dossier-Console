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
  DocumentKind,
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
  parent_id: string | null
  kind: string
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

function withChildren(docs: LibraryDocument[]): LibraryDocument[] {
  return docs.map((doc) => ({
    ...doc,
    children: docs
      .filter((d) => d.parentId === doc.id)
      .map((child) => child.id),
  }))
}

interface DocumentLibraryValue {
  documents: LibraryDocument[]
  loading: boolean
  getDocument: (id: string) => LibraryDocument | undefined
  getDocumentsByProject: (projectId: string) => LibraryDocument[]
  getDocumentsByParent: (projectId: string, parentId: string | null) => LibraryDocument[]
  getDocumentPath: (id: string) => LibraryDocument[]
  saveDocument: (doc: DocDocument, projectId?: string, parentId?: string | null) => LibraryDocument
  addFolder: (name: string, projectId: string, parentId?: string | null) => LibraryDocument
  updateMeta: (
    id: string,
    patch: Partial<Pick<DocDocument, "name" | "description" | "category" | "author" | "version" | "status"> & { parentId: string | null }>
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
    parent_id: record.parentId ?? null,
    kind: record.kind ?? "document",
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
        setDocuments(withChildren(((docs.data ?? []) as DocumentRow[]).map((row) => ({
          ...row.data,
          projectId: row.project_id ?? undefined,
          parentId: row.parent_id ?? null,
          kind: (row.kind ?? "document") as DocumentKind,
          children: [],
        }))))
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

  const getDocumentsByParent = useCallback(
    (projectId: string, parentId: string | null) =>
      documents.filter(
        (doc) => doc.projectId === projectId && (doc.parentId ?? null) === parentId
      ),
    [documents]
  )

  const getDocumentPath = useCallback(
    (id: string): LibraryDocument[] => {
      const path: LibraryDocument[] = []
      let current = documents.find((doc) => doc.id === id)
      while (current) {
        path.unshift(current)
        current = current.parentId
          ? documents.find((doc) => doc.id === current!.parentId)
          : undefined
      }
      return path
    },
    [documents]
  )

  const saveDocument = useCallback(
    (doc: DocDocument, projectId?: string, parentId?: string | null): LibraryDocument => {
      const existing = documents.find((item) => item.id === doc.id)
      const record: LibraryDocument = {
        ...doc,
        projectId: projectId ?? existing?.projectId,
        parentId: parentId !== undefined ? parentId : (existing?.parentId ?? null),
        kind: existing?.kind ?? "document",
        children: existing?.children ?? [],
        updatedAt: nowIso(),
        versions: existing?.versions ?? [],
      }
      setDocuments((prev) => {
        const next = existing
          ? prev.map((item) => (item.id === doc.id ? record : item))
          : [record, ...prev]
        return withChildren(next)
      })

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

  const addFolder = useCallback(
    (name: string, projectId: string, parentId?: string | null): LibraryDocument => {
      const now = nowIso()
      const record: LibraryDocument = {
        id: uid(),
        name,
        description: "",
        category: "custom",
        type: "folder",
        status: "draft",
        author: "Admin",
        version: "1.0",
        createdAt: now,
        updatedAt: now,
        mode: "freeform",
        theme: {
          headingFont: "Inter",
          bodyFont: "Inter",
          codeFont: "monospace",
          primary: "#000000",
          secondary: "#666666",
          accent: "#3b82f6",
          background: "#ffffff",
          text: "#000000",
          border: "#e5e7eb",
          pageMargin: 0,
          sectionSpacing: 0,
          paragraphSpacing: 0,
          componentSpacing: 0,
          companyName: "",
          footerText: "",
        },
        variables: [],
        pages: [],
        grid: 8,
        snapToGrid: true,
        versions: [],
        projectId,
        parentId: parentId ?? null,
        kind: "folder",
        children: [],
      }
      setDocuments((prev) => withChildren([record, ...prev]))

      void safeAsync(async () => {
        await persistOrQueue(
          { kind: "upsert", table: "documents", row: documentRow(record), context: "DocumentLibrary.addFolder" },
          () => getSupabase().from("documents").upsert(documentRow(record))
        )
      }, { context: "DocumentLibrary.addFolder" })

      return record
    },
    []
  )

  const updateMeta: DocumentLibraryValue["updateMeta"] = useCallback(
    (id, patch) => {
      const stamp = nowIso()
      let next: LibraryDocument | undefined
      setDocuments((prev) => {
        const updated = prev.map((item) => {
          if (item.id !== id) return item
          next = { ...item, ...patch, updatedAt: stamp }
          return next
        })
        return withChildren(updated)
      })

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
      copy.parentId = source.parentId ?? null
      copy.kind = source.kind
      copy.children = []
      setDocuments((prev) => withChildren([copy, ...prev]))

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
    const collect = (parentId: string): string[] => {
      const children = documents.filter((doc) => doc.parentId === parentId)
      return [parentId, ...children.flatMap((child) => collect(child.id))]
    }
    const ids = collect(id)
    setDocuments((prev) => {
      const next = prev.filter((doc) => !ids.includes(doc.id))
      return withChildren(next)
    })

    void safeAsync(async () => {
      const client = getSupabase()
      for (const docId of ids) {
        await client.from("documents").delete().eq("id", docId)
      }
    }, { context: "DocumentLibrary.removeDocument" })
  }, [documents])

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
      getDocumentsByParent,
      getDocumentPath,
      saveDocument,
      addFolder,
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
      getDocumentsByParent,
      getDocumentPath,
      saveDocument,
      addFolder,
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
