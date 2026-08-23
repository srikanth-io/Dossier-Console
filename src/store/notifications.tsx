import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import { errorCodes } from "@/constants/messages/errors"
import type {
  NotificationEntry,
  NotificationType,
} from "@/data/notifications"
import { AppError } from "@/lib/errors"
import { formatRelative } from "@/lib/time"
import { getSupabase } from "@/lib/supabase"
import { safeAsync } from "@/lib/async"
import { isNetworkError, persistOrQueue } from "@/lib/mutation-queue"
import { useAuth } from "@/store/auth"

export type { NotificationEntry, NotificationType } from "@/data/notifications"

type NotificationRow = {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  screen: string | null
  read: boolean
  created_at: string
}

type NotificationsValue = {
  notifications: NotificationEntry[]
  unreadCount: number
  loading: boolean
  add: (title: string, message: string, type?: NotificationType, screen?: string) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clear: (id: string) => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsValue | null>(null)

function rowToNotification(row: NotificationRow): NotificationEntry {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    timestamp: formatRelative(row.created_at),
    screen: row.screen ?? undefined,
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const authenticated = status === "authenticated"

  const [notifications, setNotifications] = useState<NotificationEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authenticated) {
      setNotifications([])
      return
    }

    let cancelled = false
    setLoading(true)

    void safeAsync(async () => {
      const { data, error } = await getSupabase()
        .from("app_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
      if (error) throw new AppError(errorCodes.dataLoadFailed, error.message)
      if (!cancelled) {
        setNotifications(((data ?? []) as NotificationRow[]).map(rowToNotification))
      }
    }, { context: "Notifications.load" }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [authenticated])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const add = useCallback(
    (title: string, message: string, type: NotificationType = "info", screen?: string) => {
      const id = crypto.randomUUID()
      setNotifications((prev) => [
        {
          id,
          title,
          message,
          type,
          read: false,
          timestamp: formatRelative(new Date().toISOString()),
          screen,
        },
        ...prev,
      ])
      toast(title, { description: message })

      void safeAsync(async () => {
        const row = { id, title, message, type, screen: screen ?? null }
        await persistOrQueue(
          { kind: "upsert", table: "app_notifications", row, context: "Notifications.add" },
          () => getSupabase().from("app_notifications").upsert(row)
        )
      }, { context: "Notifications.add" })
    },
    []
  )

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )

    void safeAsync(async () => {
      await persistOrQueue(
        { kind: "upsert", table: "app_notifications", row: { id, read: true }, context: "Notifications.markRead" },
        () => getSupabase().from("app_notifications").update({ read: true }).eq("id", id)
      )
    }, { context: "Notifications.markRead" })
  }, [notifications])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)

    void safeAsync(async () => {
      if (!navigator.onLine) {
        for (const nid of unreadIds) {
          await persistOrQueue(
            { kind: "upsert", table: "app_notifications", row: { id: nid, read: true }, context: "Notifications.markAllRead" },
            async () => ({ error: null })
          )
        }
        return
      }
      try {
        const { error } = await getSupabase()
          .from("app_notifications")
          .update({ read: true })
          .eq("read", false)
        if (error) throw new AppError(errorCodes.dataSaveFailed, error.message)
      } catch (error) {
        if (!isNetworkError(error)) throw error
        for (const nid of unreadIds) {
          await persistOrQueue(
            { kind: "upsert", table: "app_notifications", row: { id: nid, read: true }, context: "Notifications.markAllRead" },
            async () => ({ error: null })
          )
        }
      }
    }, { context: "Notifications.markAllRead" })
  }, [notifications])

  const clear = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))

    void safeAsync(async () => {
      await persistOrQueue(
        { kind: "delete", table: "app_notifications", column: "id", value: id, context: "Notifications.clear" },
        () => getSupabase().from("app_notifications").delete().eq("id", id)
      )
    }, { context: "Notifications.clear" })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])

    const allIds = notifications.map((n) => n.id)

    void safeAsync(async () => {
      if (!navigator.onLine) {
        for (const nid of allIds) {
          await persistOrQueue(
            { kind: "delete", table: "app_notifications", column: "id", value: nid, context: "Notifications.clearAll" },
            async () => ({ error: null })
          )
        }
        return
      }
      try {
        const { error } = await getSupabase()
          .from("app_notifications")
          .delete()
          .neq("id", "")
        if (error) throw new AppError(errorCodes.dataDeleteFailed, error.message)
      } catch (error) {
        if (!isNetworkError(error)) throw error
        for (const nid of allIds) {
          await persistOrQueue(
            { kind: "delete", table: "app_notifications", column: "id", value: nid, context: "Notifications.clearAll" },
            async () => ({ error: null })
          )
        }
      }
    }, { context: "Notifications.clearAll" })
  }, [notifications])

  const value = useMemo<NotificationsValue>(
    () => ({ notifications, unreadCount, loading, add, markRead, markAllRead, clear, clearAll }),
    [notifications, unreadCount, loading, add, markRead, markAllRead, clear, clearAll]
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsValue {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider")
  return context
}
