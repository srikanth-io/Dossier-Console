export const landing = {
  header: {
    nav: {
      features: "Features",
      templates: "Templates",
      pricing: "Pricing",
      docs: "Docs",
      howItWorks: "How it works",
      signIn: "Sign in",
      getStarted: "Get started",
    },
  },
  hero: {
    badge: "Trusted by 200+ teams",
    titleLine1: "Every dossier.",
    titleLine2: "One console.",
    subtitle:
      "Dossier gives your team a single, secure home for records, reviews, and reports — so nothing falls through the cracks.",
    primaryCta: "Get started free",
    secondaryCta: "See how it works",
  },
  logos: [
    "Northwind",
    "Vertex",
    "Aperture",
    "Pulse",
    "Quanta",
    "Meridian",
  ],
  download: {
    getItOn: "GET IT ON",
    googlePlay: "Google Play",
    downloadOn: "Download on the",
    appStore: "App Store",
  },
  features: {
    title: "Everything your records need",
    subtitle:
      "Purpose-built tools for teams that live in documents, cases, and deadlines.",
  },
  howItWorks: {
    title: "Get started in three steps",
    subtitle:
      "From sign-up to your first reviewed dossier in minutes.",
  },
  cta: {
    title: "Ready to organize your dossiers?",
    subtitle:
      "Join teams that keep their records secure, reviewed, and always within reach.",
    button: "Get started free",
  },
  footer: {
    tagline: "Secure, organized records for modern teams.",
    product: "Product",
    productLinks: ["Features", "Changelog"],
    company: "Company",
    companyLinks: ["About", "Blog", "Careers"],
    resources: "Resources",
    resourceLinks: ["Documentation", "Support", "Contact"],
    copyright: (year: number) => `© ${year} Dossier. All rights reserved.`,
  },
} as const
