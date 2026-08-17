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

export const initialNotifications: NotificationEntry[] = [
  {
    id: "n1",
    title: "Service down",
    message: "Search Engine is currently unreachable. Attempting automatic restart.",
    type: "error",
    read: false,
    timestamp: "2 min ago",
    screen: "Services",
  },
  {
    id: "n2",
    title: "Email service degraded",
    message: "Email Service response time exceeded 1s threshold. Investigating.",
    type: "warning",
    read: false,
    timestamp: "8 min ago",
    screen: "Services",
  },
  {
    id: "n3",
    title: "New device signed in",
    message: "A new device (Chrome on Windows) signed in from 192.168.1.42.",
    type: "info",
    read: false,
    timestamp: "15 min ago",
    screen: "Security",
  },
  {
    id: "n4",
    title: "Timesheet submitted",
    message: "Project Alpha timesheet for Aug 11–17 has been submitted for review.",
    type: "success",
    read: true,
    timestamp: "1 hour ago",
    screen: "Timesheet",
  },
  {
    id: "n5",
    title: "MFA enabled",
    message: "Authenticator app MFA has been enabled on your account.",
    type: "success",
    read: true,
    timestamp: "3 hours ago",
    screen: "Settings",
  },
  {
    id: "n6",
    title: "Weekly digest ready",
    message: "Your weekly activity digest for Aug 10–16 is available.",
    type: "info",
    read: true,
    timestamp: "Yesterday",
  },
]
