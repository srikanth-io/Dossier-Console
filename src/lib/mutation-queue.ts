import { errorCodes } from "@/constants/messages/errors"
import { AppError } from "./errors"
import { getSupabase } from "./supabase"

/**
 * Offline mutation queue.
 *
 * Stores run their UI updates optimistically, then hand the network write to
 * `persistOrQueue`. When the device is offline (or the request fails with a
 * network error) the write is queued in localStorage and replayed by
 * `flushQueue` once connectivity returns — so no user action is ever lost.
 */

const QUEUE_KEY = "dossier-mutation-queue"

export type QueuedMutation =
  | {
      kind: "upsert"
      table: string
      row: Record<string, unknown>
      context: string
    }
  | {
      kind: "delete"
      table: string
      column: string
      value: string
      context: string
    }

type QueueItem = QueuedMutation & { id: string; queuedAt: string }

function readQueue(): QueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as QueueItem[]) : []
  } catch {
    return []
  }
}

function writeQueue(items: QueueItem[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
  } catch {
    // Storage full/unavailable - nothing else we can do here.
  }
}

function enqueue(mutation: QueuedMutation) {
  const items = readQueue()
  items.push({
    ...mutation,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    queuedAt: new Date().toISOString(),
  })
  writeQueue(items)
}

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true
  const message =
    error instanceof Error ? error.message : String(error ?? "")
  return /failed to fetch|networkerror|network error|load failed|internet disconnected|err_internet/i.test(
    message
  )
}

type QueryResult = { error: { message: string } | null }

/**
 * Runs a Supabase write now when online; otherwise queues it for later replay.
 * Wrap inside the store's existing `safeAsync` so unexpected errors still log.
 */
export async function persistOrQueue(
  mutation: QueuedMutation,
  run: () => PromiseLike<QueryResult>
): Promise<void> {
  if (!navigator.onLine) {
    enqueue(mutation)
    return
  }

  try {
    const result = await run()
    if (result.error) throw new AppError(errorCodes.dataSaveFailed, result.error.message)
  } catch (error) {
    if (isNetworkError(error)) {
      enqueue(mutation)
      return
    }
    throw error
  }
}

/** Replays queued mutations in order. Returns how many were applied. */
export async function flushQueue(): Promise<number> {
  if (!navigator.onLine) return 0

  const items = readQueue()
  if (items.length === 0) return 0

  const client = getSupabase()
  let applied = 0

  for (const item of items) {
    let failed = false
    try {
      const result =
        item.kind === "upsert"
          ? await client.from(item.table).upsert(item.row)
          : await client.from(item.table).delete().eq(item.column, item.value)
      failed = Boolean(result.error)
    } catch {
      failed = true
    }
    if (failed) break // Still offline / unreachable - keep the rest queued.

    applied += 1
  }

  if (applied > 0) {
    writeQueue(items.slice(applied))
  }
  return applied
}
