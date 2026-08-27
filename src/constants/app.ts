export const APP = {
  name: "Dossier",
  console: "Admin Console",
  tagline: "Manage records and case files",
  version: "v0.1.0",
  organization: "Srikanth Sankar",
} as const

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  mfaVerify: "/mfa/verify",
  app: "/app",
  dashboard: "/app",
  projects: "/app/projects",
  projectDetail: "/app/projects/:id",
  projectDocuments: "/app/projects/:id/documents",
  projectDocumentEditor: "/app/projects/:id/documents/:docId",
  projectTimesheet: "/app/projects/:id/timesheet",
  projectNotes: "/app/projects/:id/notes",
  projectNoteEditor: "/app/projects/:id/notes/:noteId",
  resumes: "/app/resumes",
  resumeBuilder: "/app/resumes/builder",
  resumeBuilderEdit: "/app/resumes/builder/:id",
  settings: "/app/settings",
  // Legacy aliases (kept for backward compat with old pages)
  documents: "/app/resumes",
  templates: "/app/resumes",
  studio: "/app/resumes",
  studioEditor: "/app/resumes/builder",
  dossiers: "/app/resumes",
  resumeCreator: "/app/resumes/builder",
  pages: "/app/projects",
  pageDetail: "/app/projects",
  notepad: "/app/projects",
  notepadDetail: "/app/projects",
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

/**
 * Absolute client-side session cap. Mirrors [auth.sessions] timebox in
 * supabase/config.toml; the server remains the authoritative enforcement.
 */
export const AUTH_SESSION = {
  ttlMs: 60 * 60 * 1000,
  checkIntervalMs: 30 * 1000,
} as const
