export const APP = {
  name: "Dossier",
  console: "Admin Console",
  tagline: "Manage records and case files",
  version: "v0.1.0",
  organization: "Swiftant",
  defaultWorkspaceName: "Swiftant",
} as const

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/signup",
  app: "/app",
  dashboard: "/app",
  documents: "/app/documents",
  templates: "/app/templates",
  studio: "/app/templates",
  studioEditor: "/app/templates/editor",
  legacyResumeTemplates: "/app/dossiers/templates",
  resumeCreator: "/app/dossiers/creator",
  dossiers: "/app/dossiers",
  settings: "/app/settings",
} as const

export type RouteName = keyof typeof ROUTES

export const API = {
  baseUrl: "/api",
} as const

export const SPLASH = {
  displayMs: 2200,
  logoMs: 1600,
  fadeMs: 500,
} as const
