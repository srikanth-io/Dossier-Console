export const dashboard = {
  title: "Dashboard",
  subtitle: "Overview of your dossier workspace.",
  eyebrow: "Overview",
  newDossier: "New Dossier",
  actions: {
    templates: "Template library",
  },
  stats: {
    totalDossiers: "Total Dossiers",
    drafts: "Drafts",
    publishedDocs: "Published",
    projects: "Projects",
    hints: {
      totalDossiers: "In your library",
      drafts: "Not yet published",
      publishedDocs: "Live in your library",
      projects: "Assigned to you",
    },
  },
  charts: {
    weekly: {
      title: "Documents per week",
      description: "Created in the last 7 days.",
    },
    weeklyCreated: "Created",
    weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    types: {
      title: "Document types",
      description: "Distribution of documents by type.",
    },
    typesTotal: (count: number) => `${count} total`,
    typeVapt: "VAPT / security",
    typeInvoices: "Invoices",
    typeResume: "Resumes",
    typeStudy: "Study material",
    typeProposals: "Proposals",
    typeReports: "Reports",
    typeBusiness: "Business",
    typeEducation: "Education",
    typeCertificates: "Certificates",
    typeCustom: "Custom",
  },
  recent: {
    title: "Recent documents",
    description: "Latest updates across your workspace.",
    viewAll: "View all",
  },
  recentView: "View details",
  quickActions: {
    label: "Quick actions",
    templates: {
      title: "Template library",
      description: "Start from a ready-made template.",
    },
    documents: {
      title: "Documents",
      description: "Review, export and manage documents.",
    },
    resumeCreator: {
      title: "Resume creator",
      description: "Compose a resume from LaTeX.",
    },
    settings: {
      title: "Settings",
      description: "Tune your workspace and appearance.",
    },
  },
  emptyRecent: "No recent dossiers yet.",
} as const
