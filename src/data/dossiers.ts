import { commonMessages, statusLabels } from "@/constants/messages/common"

export type Dossier = {
  id: string
  subject: string
  owner: string
  department: string
  status: string
  updated: string
}

export const dossierStatusFilters = [
  { value: "all", label: commonMessages.all },
  { value: statusLabels.draft, label: statusLabels.draft },
  { value: statusLabels.inReview, label: statusLabels.inReview },
  { value: statusLabels.complete, label: statusLabels.complete },
] as const

export const dossiers: Dossier[] = [
  {
    id: "DSR-2084",
    subject: "Acme Corp. Acquisition",
    owner: "R. Sharma",
    department: "Legal",
    status: statusLabels.inReview,
    updated: "2h ago",
  },
  {
    id: "DSR-2083",
    subject: "Northwind Contract",
    owner: "K. Patel",
    department: "Finance",
    status: statusLabels.complete,
    updated: "5h ago",
  },
  {
    id: "DSR-2082",
    subject: "GlobalTrade Compliance",
    owner: "J. Chen",
    department: "Compliance",
    status: statusLabels.draft,
    updated: "Yesterday",
  },
  {
    id: "DSR-2081",
    subject: "Vertex v2 Audit",
    owner: "M. Johnson",
    department: "Audit",
    status: statusLabels.inReview,
    updated: "Yesterday",
  },
  {
    id: "DSR-2080",
    subject: "Summit Renewal",
    owner: "R. Sharma",
    department: "Legal",
    status: statusLabels.complete,
    updated: "2 days ago",
  },
  {
    id: "DSR-2079",
    subject: "Pioneer Due Diligence",
    owner: "K. Patel",
    department: "Finance",
    status: statusLabels.draft,
    updated: "3 days ago",
  },
]
