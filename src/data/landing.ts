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

export type TestimonialQuote = {
  text: string
  title: string
  author: string
  role: string
  image: string
}

export const testimonialQuotes: TestimonialQuote[] = [
  {
    text: "Dossier cut our compliance review time in half. The workflow automation alone is worth it.",
    title: "Compliance",
    author: "Sarah Chen",
    role: "Compliance Director",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop",
  },
  {
    text: "We replaced three separate tools with Dossier. Everything is in one place now — finally.",
    title: "Consolidation",
    author: "Marcus Rivera",
    role: "Operations Manager",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  },
  {
    text: "The audit trail feature means we're always exam-ready. No more last-minute scrambles.",
    title: "Audit Ready",
    author: "Priya Sharma",
    role: "Legal Counsel",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
  },
  {
    text: "Our team onboarding went from two weeks to two days. Dossier just works.",
    title: "Onboarding",
    author: "James O'Brien",
    role: "HR Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop",
  },
  {
    text: "The template system saved us hundreds of hours on repetitive document creation.",
    title: "Templates",
    author: "Aisha Patel",
    role: "Project Lead",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=300&fit=crop",
  },
  {
    text: "Real-time collaboration on sensitive documents? Dossier nails it with granular permissions.",
    title: "Collaboration",
    author: "David Kim",
    role: "Security Analyst",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop",
  },
]

export const appIcons = [
  { name: "Docs", color: "#4285F4" },
  { name: "Slack", color: "#4A154B" },
  { name: "Notion", color: "#000000" },
  { name: "Teams", color: "#6264A7" },
  { name: "Zoom", color: "#2D8CFF" },
  { name: "Figma", color: "#F24E1E" },
  { name: "GitHub", color: "#181717" },
  { name: "Jira", color: "#0052CC" },
]
