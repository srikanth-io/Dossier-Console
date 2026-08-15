import { useCallback, useMemo, useState } from "react"

export function uid(): string {
  return (
    Math.random().toString(36).slice(2, 7) +
    Date.now().toString(36).slice(-4)
  ).toUpperCase()
}

export function useDocumentHistory<T>(initial: T) {
  const [past, setPast] = useState<T[]>([])
  const [present, setPresent] = useState<T>(initial)
  const [future, setFuture] = useState<T[]>([])

  const commit = useCallback((next: T) => {
    setPast((p) => [...p.slice(-49), present])
    setPresent(next)
    setFuture([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present])

  const begin = useCallback(() => {
    setPast((p) => [...p.slice(-49), present])
    setFuture([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present])

  const replace = useCallback((next: T) => {
    setPresent(next)
  }, [])

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p
      const previous = p[p.length - 1]
      setPresent(previous)
      setFuture((f) => [present, ...f])
      return p.slice(0, -1)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f
      const next = f[0]
      setPresent(next)
      setPast((p) => [...p, present])
      return f.slice(1)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present])

  const reset = useCallback((next: T) => {
    setPast([])
    setPresent(next)
    setFuture([])
  }, [])

  return useMemo(
    () => ({
      present,
      commit,
      begin,
      replace,
      undo,
      redo,
      reset,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
    }),
    [present, commit, begin, replace, undo, redo, reset, past.length, future.length]
  )
}
