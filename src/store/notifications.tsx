import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import {
  initialNotifications,
  type NotificationEntry,
  type NotificationType,
} from "@/data/notifications"

type NotificationsValue = {
  notifications: NotificationEntry[]
  unreadCount: number
  add: (title: string, message: string, type?: NotificationType, screen?: string) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clear: (id: string) => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsValue | null>(null)

let counter = initialNotifications.length + 1

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationEntry[]>(initialNotifications)
  const addedRef = useRef(new Set<string>())

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const add = useCallback(
    (title: string, message: string, type: NotificationType = "info", screen?: string) => {
      const id = `n${counter++}`
      const entry: NotificationEntry = {
        id,
        title,
        message,
        type,
        read: false,
        timestamp: "Just now",
        screen,
      }
      setNotifications((prev) => [entry, ...prev])

      if (!addedRef.current.has(id)) {
        addedRef.current.add(id)
        toast(title, {
          description: message,
        })
      }
    },
    []
  )

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clear = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value = useMemo<NotificationsValue>(
    () => ({ notifications, unreadCount, add, markRead, markAllRead, clear, clearAll }),
    [notifications, unreadCount, add, markRead, markAllRead, clear, clearAll]
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
