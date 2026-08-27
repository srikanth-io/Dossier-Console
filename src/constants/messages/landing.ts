export const landing = {
  header: {
    nav: {
      features: "Features",
      solutions: "Solutions",
      resources: "Resources",
      pricing: "Pricing",
      signIn: "Sign in",
      getStarted: "Try Dossier Free",
    },
  },
  hero: {
    badge: "Trusted by 200+ teams worldwide",
    eyebrow: "Dossier Network",
    titleLine1: "Every dossier.",
    titleLine2: "One console.",
    subtitle:
      "A single, secure home for your records, reviews, and reports — so nothing falls through the cracks.",
    primaryCta: "Get started free",
    secondaryCta: "See how it works",
  },
  telemetry: [
    { label: "Active nodes", value: "12,840" },
    { label: "Median latency", value: "24 ms" },
    { label: "Throughput", value: "1.2M / day" },
    { label: "Network uptime", value: "99.99%" },
  ],
  network: {
    eyebrow: "Connected fabric",
    title: "One console for every signal",
    subtitle:
      "Records, reviews, and reports flow through a single encrypted mesh — so your whole team always sees the complete picture.",
  },
  logos: {
    title: "Trusted by compliance teams and legal departments everywhere",
    partners: ["Notion", "Slack", "Stripe", "AWS", "Salesforce", "HubSpot"],
  },
  appShowcase: {
    title: "Manage documents across every device",
    subtitle:
      "Dossier works on desktop and mobile, syncing your records in real time. Access critical files wherever your team operates.",
  },
  speed: {
    title: "4x faster reviews",
    subtitle:
      "Automate repetitive tasks and route dossiers through approval workflows — cutting review cycles from days to hours.",
    typing: "Manual",
    typingSpeed: "3 days",
    typingDesc: "Email threads, spreadsheets, and manual follow-ups",
    dossier: "Dossier",
    dossierSpeed: "4 hours",
    dossierDesc: "Automated routing, status tracking, and one-click reports",
  },
  madeFor: {
    title: "Made for the",
    titleItalic: "way you work",
    subtitle: "Built for real-world compliance and legal workflows.",
    description:
      "Whether you're onboarding a new client, running an audit, or closing a deal — Dossier adapts to your process, not the other way around.",
    oneTool: "One console. Your entire workflow.",
    oneToolDesc:
      "Replace scattered files, email threads, and status spreadsheets with one secure platform your whole team can trust.",
  },
  features: {
    title: "Everything your records need",
    subtitle:
      "Purpose-built tools for teams that live in documents, cases, and deadlines.",
    aiEdits: {
      title: "Smart templates",
      description:
        "Create dossiers from proven templates. Auto-fill fields, attach files, and route for review in one step.",
    },
    dictionary: {
      title: "Role-based access",
      description:
        "Give editors, reviewers, and viewers exactly the right level of access — down to individual documents.",
    },
    snippets: {
      title: "Review workflows",
      description:
        "Route dossiers through approvals with clear status at every step. No more chasing people for sign-offs.",
    },
    languages: {
      title: "Audit trail",
      description:
        "Every change is logged with timestamps and user attribution. Stay audit-ready without the paperwork.",
    },
  },
  platform: {
    title: "Dossier, wherever you work",
    subtitle:
      "Desktop, web, and mobile — Dossier keeps your records secure and synced across every device your team uses.",
    cta: "Explore",
  },
  testimonials: {
    title: "Loved by teams everywhere",
    subtitle: "Here's what our users have to say.",
    quotes: [
      {
        text: "Dossier cut our compliance review time in half. The workflow automation alone is worth it.",
        author: "Sarah Chen",
        role: "Compliance Director",
      },
      {
        text: "We replaced three separate tools with Dossier. Everything is in one place now — finally.",
        author: "Marcus Rivera",
        role: "Operations Manager",
      },
      {
        text: "The audit trail feature means we're always exam-ready. No more last-minute scrambles.",
        author: "Priya Sharma",
        role: "Legal Counsel",
      },
    ],
  },
  stats: [
    {
      label: "Faster onboarding",
      value: "From days to hours",
    },
    {
      label: "Audit-ready",
      value: "Every change logged",
    },
    {
      label: "Teams onboarded",
      value: "200+",
    },
    {
      label: "Review completion",
      value: "99.5%",
    },
  ],
  cta: {
    title: "Ready to take control?",
    subtitle:
      "Join teams that keep their records secure, reviewed, and always within reach.",
    placeholder: "Enter your email",
    button: "Get started free",
  },
  footer: {
    tagline: "Secure, organized records for modern teams.",
    product: "Product",
    productLinks: [
      "Dossiers",
      "Templates",
      "Review Workflows",
      "Reports",
      "Changelog",
    ],
    company: "Company",
    companyLinks: ["About", "Blog", "Careers"],
    resources: "Resources",
    resourceLinks: ["Documentation", "Support", "Contact"],
    legal: "Legal",
    legalLinks: ["Terms of Service", "Privacy Policy", "Security"],
    copyright: (year: number) => `© ${year} Dossier. All rights reserved.`,
  },
} as const
