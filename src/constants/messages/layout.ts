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
    documents: "Documents",
    dossiers: "Resumes",
    templates: "Templates",
    settings: "Settings",
  },
} as const

export const layout = {
  searchPlaceholder: commonMessages.searchPlaceholder,
  signedInAs: commonMessages.signedInAs,
  signOut: commonMessages.signOut,
  signOutTitle: "Sign out?",
  signOutDescription:
    "Are you sure you want to sign out? You can sign back in anytime.",
  userName: "Admin",
  userInitials: "SA",
  userEmail: "admin@swiftant.com",
} as const
