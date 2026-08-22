import { commonMessages } from "@/constants/messages/common"

export const nav = {
  brand: "Dossier",
  console: "Admin Console",
  sections: {
    general: "General",
    content: "Content",
  },
  items: {
    dashboard: "Dashboard",
    templates: "Templates",
    projects: "Projects",
    files: "Files",
    notepad: "Notepad",
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
  userInitials: "SS",
  userEmail: "admin@dossier.dev",
  themeToggleLight: "Switch to light mode",
  themeToggleDark: "Switch to dark mode",
  themeLight: "Light mode",
  themeDark: "Dark mode",
} as const
