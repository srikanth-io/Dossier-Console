export type NotificationType = "info" | "success" | "warning" | "error"

export type NotificationEntry = {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  timestamp: string
  screen?: string
}
