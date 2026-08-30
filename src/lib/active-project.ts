import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "dossier-active-project"

function readActiveProject(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function useActiveProject() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(readActiveProject)

  useEffect(() => {
    const handler = () => {
      const next = readActiveProject()
      if (next !== activeProjectId) setActiveProjectId(next)
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [activeProjectId])

  const setActive = useCallback((id: string) => {
    setActiveProjectId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // storage full or blocked
    }
  }, [])

  return { activeProjectId, setActive }
}
