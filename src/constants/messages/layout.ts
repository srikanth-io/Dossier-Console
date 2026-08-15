import { commonMessages } from "@/constants/messages/common"

export const nav = {
  brand: "Dossier",
  console: "Admin Console",
  sections: {
    overview: "Overview",
    workspace: "Workspace",
    system: "System",
  },
  items: {
    dashboard: "Dashboard",
    dossiers: "Dossiers",
    users: "Users",
    reports: "Reports",
    settings: "Settings",
  },
} as const

export const layout = {
  searchPlaceholder: commonMessages.searchPlaceholder,
  signedInAs: commonMessages.signedInAs,
  signOut: commonMessages.signOut,
  userName: "Admin",
  userInitials: "SA",
} as const
