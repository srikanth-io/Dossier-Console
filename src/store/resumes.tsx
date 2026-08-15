import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

import { resumeTemplates } from "@/data/resumeTemplates"
import type { Resume } from "@/data/dossiers"

const seedResumes: Resume[] = resumeTemplates.map((template, index) => ({
  id: `RES-${String(index + 1).padStart(3, "0")}`,
  name: `Resume_${template.name}.tex`,
  type: "TEX",
  size: `${Math.max(1, Math.round(template.source.length / 1024))} KB`,
  updated: index === 0 ? "Today" : index === 1 ? "Yesterday" : "2 days ago",
  source: template.source,
}))

type ResumeLibraryValue = {
  resumes: Resume[]
  addResume: (resume: Omit<Resume, "id"> & { id?: string }) => Resume
  updateResume: (id: string, patch: Partial<Resume>) => void
  removeResume: (id: string) => void
}

const ResumeLibraryContext = createContext<ResumeLibraryValue | null>(null)

export function ResumeLibraryProvider({ children }: { children: ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>(seedResumes)

  const addResume = useCallback(
    (resume: Omit<Resume, "id"> & { id?: string }) => {
      const id =
        resume.id ??
        `RES-${String(
          Math.max(0, ...resumes.map((r) => Number(r.id.replace(/\D/g, "") || 0))) + 1
        ).padStart(3, "0")}`
      const next: Resume = { ...resume, id }
      setResumes((prev) => [next, ...prev])
      return next
    },
    [resumes]
  )

  const updateResume = useCallback((id: string, patch: Partial<Resume>) => {
    setResumes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    )
  }, [])

  const removeResume = useCallback((id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const value = useMemo(
    () => ({ resumes, addResume, updateResume, removeResume }),
    [resumes, addResume, updateResume, removeResume]
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
