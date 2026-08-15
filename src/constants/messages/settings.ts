export const settings = {
  title: "Settings",
  subtitle: "Configure your workspace preferences.",
  workspace: {
    title: "Workspace",
    description: "General settings for your Dossier workspace.",
    workspaceName: "Workspace name",
    defaultDepartment: "Default department",
    selectDepartment: "Select department",
  },
  workflow: {
    title: "Workflow",
    description: "Configure review and notification behaviour.",
    reviewRequired: "Review required",
    reviewRequiredHint: "Require approval before a dossier is marked complete.",
    notifications: "Email notifications",
    notificationsHint: "Send updates when dossiers change or complete.",
  },
} as const
