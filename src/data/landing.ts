import type { IconName } from "@/constants/icons"

export const landingPreview = {
  url: "app.dossier.com",
} as const

export type LandingFeature = {
  title: string
  description: string
  icon: IconName
}

export const landingFeatures: LandingFeature[] = [
  {
    title: "Centralized records",
    description:
      "Keep every document and case file organized in one searchable place.",
    icon: "dossiers",
  },
  {
    title: "Role-based access",
    description:
      "Give editors, reviewers, and viewers exactly the right level of access.",
    icon: "users",
  },
  {
    title: "Review workflows",
    description:
      "Route dossiers through approvals with clear status at every step.",
    icon: "activity",
  },
  {
    title: "Reports & insights",
    description:
      "Turn daily work into monthly summaries, backlogs, and compliance checks.",
    icon: "reports",
  },
  {
    title: "Security you control",
    description:
      "Encryption, audit logs, and granular permissions keep records safe.",
    icon: "lock",
  },
  {
    title: "Built for compliance",
    description:
      "Stay audit-ready with checklists and a complete history of every change.",
    icon: "shield",
  },
]

export type LandingStat = {
  label: string
  value: string
}

export const landingStats: LandingStat[] = [
  { label: "Dossiers managed", value: "12k+" },
  { label: "Teams onboarded", value: "200+" },
  { label: "Review completion", value: "99.5%" },
  { label: "Uptime", value: "99.9%" },
]

export type LandingStep = {
  title: string
  description: string
  icon: IconName
}

export const landingSteps: LandingStep[] = [
  {
    title: "Create a workspace",
    description: "Set up your console and invite your team in minutes.",
    icon: "sparkles",
  },
  {
    title: "Build your dossiers",
    description: "Collect documents, assign owners, and track status.",
    icon: "newDossier",
  },
  {
    title: "Review and report",
    description: "Route approvals, export summaries, and stay audit-ready.",
    icon: "reports",
  },
]
