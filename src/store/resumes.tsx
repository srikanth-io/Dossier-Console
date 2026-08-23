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

export type Resume = {
  id: string
  name: string
  type: string
  size: string
  updated: string
  source: string
  fileUrl?: string
}

type ResumeRow = {
  id: string
  user_id: string
  name: string
  type: string
  size_label: string
  source: string
  file_url: string | null
  created_at: string
  updated_at: string
}

type ResumeLibraryValue = {
  resumes: Resume[]
  loading: boolean
  addResume: (resume: Omit<Resume, "id"> & { id?: string }) => Resume
  updateResume: (id: string, patch: Partial<Resume>) => void
  removeResume: (id: string) => void
}

const ResumeLibraryContext = createContext<ResumeLibraryValue | null>(null)

function rowToResume(row: ResumeRow): Resume {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    size: row.size_label,
    updated: formatRelative(row.updated_at),
    source: row.source,
    fileUrl: row.file_url ?? undefined,
  }
}

export function ResumeLibraryProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const authenticated = status === "authenticated"

  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authenticated) {
      setResumes([])
      return
    }

    let cancelled = false
    setLoading(true)

    void safeAsync(async () => {
      const { data, error } = await getSupabase()
        .from("resume_files")
        .select("*")
        .order("updated_at", { ascending: false })
      if (error) throw new AppError(errorCodes.dataLoadFailed, error.message)
      if (!cancelled) setResumes(((data ?? []) as ResumeRow[]).map(rowToResume))
    }, { context: "ResumeLibrary.load" }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [authenticated])

  const addResume = useCallback(
    (resume: Omit<Resume, "id"> & { id?: string }) => {
      const next: Resume = { ...resume, id: resume.id ?? crypto.randomUUID() }
      setResumes((prev) => [next, ...prev])

      void safeAsync(async () => {
        await persistOrQueue(
          {
            kind: "upsert",
            table: "resume_files",
            row: {
              id: next.id,
              name: next.name,
              type: next.type,
              size_label: next.size,
              source: next.source,
              file_url: next.fileUrl ?? null,
            },
            context: "ResumeLibrary.addResume",
          },
          () =>
            getSupabase().from("resume_files").upsert({
              id: next.id,
              name: next.name,
              type: next.type,
              size_label: next.size,
              source: next.source,
              file_url: next.fileUrl ?? null,
            })
        )
      }, { context: "ResumeLibrary.addResume" })

      return next
    },
    []
  )

  const updateResume = useCallback((id: string, patch: Partial<Resume>) => {
    let next: Resume | undefined
    setResumes((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        next = { ...r, ...patch, updated: formatRelative(new Date().toISOString()) }
        return next
      })
    )

    if (next) {
      const record = next
      void safeAsync(async () => {
        const row = {
          id: record.id,
          name: record.name,
          type: record.type,
          size_label: record.size,
          source: record.source,
          file_url: record.fileUrl ?? null,
        }
        await persistOrQueue(
          { kind: "upsert", table: "resume_files", row, context: "ResumeLibrary.updateResume" },
          () => getSupabase().from("resume_files").update(row).eq("id", id)
        )
      }, { context: "ResumeLibrary.updateResume" })
    }
  }, [])

  const removeResume = useCallback((id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id))

    void safeAsync(async () => {
      await persistOrQueue(
        { kind: "delete", table: "resume_files", column: "id", value: id, context: "ResumeLibrary.removeResume" },
        () => getSupabase().from("resume_files").delete().eq("id", id)
      )
    }, { context: "ResumeLibrary.removeResume" })
  }, [])

  const value = useMemo(
    () => ({ resumes, loading, addResume, updateResume, removeResume }),
    [resumes, loading, addResume, updateResume, removeResume]
  )

  return (
    <ResumeLibraryContext.Provider value={value}>
      {children}
    </ResumeLibraryContext.Provider>
  )
}

export function useResumeLibrary(): ResumeLibraryValue {
  const context = useContext(ResumeLibraryContext)
  if (!context) {
    throw new Error("useResumeLibrary must be used within ResumeLibraryProvider")
  }
  return context
}
