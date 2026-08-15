import { roleLabels, statusLabels } from "@/constants/messages/common"

export type User = {
  name: string
  email: string
  initials: string
  role: string
  status: string
}

export const users: User[] = [
  {
    name: "Rajesh Sharma",
    email: "rajesh.sharma@swiftant.com",
    initials: "RS",
    role: roleLabels.admin,
    status: statusLabels.active,
  },
  {
    name: "Kiran Patel",
    email: "kiran.patel@swiftant.com",
    initials: "KP",
    role: roleLabels.reviewer,
    status: statusLabels.active,
  },
  {
    name: "Jing Chen",
    email: "jing.chen@swiftant.com",
    initials: "JC",
    role: roleLabels.reviewer,
    status: statusLabels.active,
  },
  {
    name: "Maria Johnson",
    email: "maria.johnson@swiftant.com",
    initials: "MJ",
    role: roleLabels.editor,
    status: statusLabels.invited,
  },
  {
    name: "David Lee",
    email: "david.lee@swiftant.com",
    initials: "DL",
    role: roleLabels.viewer,
    status: statusLabels.suspended,
  },
]
