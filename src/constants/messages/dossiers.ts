import { statusLabels } from "@/constants/messages/common"

export const dossiers = {
  title: "Dossiers",
  subtitle: "Manage records and case files.",
  newDossier: "New Dossier",
  allDossiers: "All Dossiers",
  recordsCount: (count: number) => `${count} records`,
  searchPlaceholder: "Search...",
  emptyResult: "No dossiers match your filters.",
  statusFilterOptions: [
    { value: "all", label: "All" },
    { value: "draft", label: statusLabels.draft },
    { value: "inReview", label: statusLabels.inReview },
    { value: "complete", label: statusLabels.complete },
  ] as const,
} as const
