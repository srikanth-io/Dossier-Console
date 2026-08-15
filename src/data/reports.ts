export type Report = {
  title: string
  description: string
  meta: string
}

export const reports: Report[] = [
  {
    title: "Monthly Dossier Summary",
    description: "Activity and volume across all dossiers for July 2026.",
    meta: "Generated 2 days ago",
  },
  {
    title: "Review Backlog",
    description: "Pending and overdue reviews grouped by reviewer.",
    meta: "Generated 5 days ago",
  },
  {
    title: "User Adoption",
    description: "Active users, logins, and feature usage over time.",
    meta: "Generated 1 week ago",
  },
  {
    title: "Compliance Checks",
    description: "Completion status of compliance tasks per dossier.",
    meta: "Generated 2 weeks ago",
  },
]
