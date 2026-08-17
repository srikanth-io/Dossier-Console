import { commonMessages } from "@/constants/messages/common"

export const nav = {
  brand: "Dossier",
  console: "Admin Console",
  sections: {
    overview: "Overview",
    content: "Content",
    organize: "Organize",
    resources: "Resources",
    system: "System",
  },
  items: {
    dashboard: "Dashboard",
    pages: "Pages",
    projects: "Projects",
    documents: "Documents",
    databases: "Databases",
    dataSources: "Data Sources",
    views: "Views",
    favorites: "Favorites",
    recent: "Recent",
    templates: "Templates",
    files: "Files",
    comments: "Comments",
    people: "People",
    connections: "Connections",
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
  themeToggleLight: "Switch to light mode",
  themeToggleDark: "Switch to dark mode",
  themeLight: "Light mode",
  themeDark: "Dark mode",
} as const
