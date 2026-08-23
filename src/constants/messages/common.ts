export const commonMessages = {
  save: "Save changes",
  cancel: "Cancel",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  export: "Export",
  download: "Download",
  new: "New",
  search: "Search",
  searchPlaceholder: "Search everything...",
  back: "Back",
  loading: "Loading...",
  retry: "Retry",
  notifications: "Notifications",
  signedInAs: "Signed in as admin",
  signOut: "Sign out",
  account: "Account",
  more: "More",
  all: "All",
  status: "Status",
  none: "None",
  selectDate: "Select date",
  jumpToToday: "Jump to today",
  networkLost: "Network lost",
  networkLostHint: "You're offline. Changes are saved on this device and will sync automatically.",
  networkRestored: "Back online",
  offlineSynced: (count: number) =>
    `${count} ${count === 1 ? "change" : "changes"} synced from offline`,
  emptyResult: "No records found.",
  updated: "Updated",
  department: "Department",
  owner: "Owner",
  subject: "Subject",
  id: "ID",
  role: "Role",
  user: "User",
  actions: "Actions",
  done: "Done",
  close: "Close",
  saveVersion: "Save version",
} as const

export const statusLabels = {
  draft: "Draft",
  inReview: "In Review",
  complete: "Complete",
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
  archived: "Archived",
} as const

export const relativeTime = {
  justNow: "Just now",
  minutesAgo: (m: number): string => `${m}m ago`,
  hoursAgo: (h: number): string => `${h}h ago`,
  yesterday: "Yesterday",
  daysAgo: (d: number): string => `${d} days ago`,
} as const

export const roleLabels = {
  admin: "Admin",
  reviewer: "Reviewer",
  editor: "Editor",
  viewer: "Viewer",
} as const

export const departmentLabels = {
  legal: "Legal",
  finance: "Finance",
  compliance: "Compliance",
  audit: "Audit",
} as const
