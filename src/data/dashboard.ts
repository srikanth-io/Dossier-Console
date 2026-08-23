import type { IconName } from "@/constants/icons"
import { statusLabels } from "@/constants/messages/common"
import { dashboard } from "@/constants/messages/dashboard"

export type StatCard = {
  label: string
  value: string
  delta: string
  icon: IconName
}

export const dashboardStats: StatCard[] = [
  {
    label: dashboard.stats.totalDossiers,
    value: "1,284",
    delta: "+12%",
    icon: "dossiers",
  },
  {
    label: dashboard.stats.drafts,
    value: "342",
    delta: "+8%",
    icon: "users",
  },
  {
    label: dashboard.stats.publishedDocs,
    value: "47",
    delta: "-5%",
    icon: "pendingReviews",
  },
  {
    label: dashboard.stats.projects,
    value: "96",
    delta: "+23%",
    icon: "reports",
  },
]

export type DossierSummary = {
  id: string
  subject: string
  owner: string
  status: string
  updated: string
}

export const recentDossiers: DossierSummary[] = [
  {
    id: "DSR-2084",
    subject: "Acme Corp. Acquisition",
    owner: "R. Sharma",
    status: statusLabels.inReview,
    updated: "2h ago",
  },
  {
    id: "DSR-2083",
    subject: "Northwind Contract",
    owner: "K. Patel",
    status: statusLabels.complete,
    updated: "5h ago",
  },
  {
    id: "DSR-2082",
    subject: "GlobalTrade Compliance",
    owner: "J. Chen",
    status: statusLabels.draft,
    updated: "Yesterday",
  },
  {
    id: "DSR-2081",
    subject: "Vertex v2 Audit",
    owner: "M. Johnson",
    status: statusLabels.inReview,
    updated: "Yesterday",
  },
  {
    id: "DSR-2080",
    subject: "Summit Renewal",
    owner: "R. Sharma",
    status: statusLabels.complete,
    updated: "2 days ago",
  },
]

export type ActivityEvent = {
  icon: IconName
  text: string
  time: string
}

export const activityEvents: ActivityEvent[] = [
  { icon: "activity", text: "12 dossiers updated", time: "8 min ago" },
  { icon: "newDossier", text: "3 new dossiers created", time: "1 h ago" },
  { icon: "users", text: "5 new users joined", time: "3 h ago" },
  { icon: "reports", text: "Monthly report generated", time: "6 h ago" },
]
