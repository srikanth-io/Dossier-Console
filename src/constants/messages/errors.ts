export const errorCodes = {
  network: "ERR_NETWORK",
  http: "ERR_HTTP",
  unauthorized: "ERR_UNAUTHORIZED",
  notFound: "ERR_NOT_FOUND",
  validation: "ERR_VALIDATION",
  timeout: "ERR_TIMEOUT",
  authNotConfigured: "ERR_AUTH_NOT_CONFIGURED",
  emailNotConfirmed: "ERR_EMAIL_NOT_CONFIRMED",
  emailAlreadyRegistered: "ERR_EMAIL_ALREADY_REGISTERED",
  weakPassword: "ERR_WEAK_PASSWORD",
  samePassword: "ERR_SAME_PASSWORD",
  rateLimited: "ERR_RATE_LIMITED",
  mfaRequired: "ERR_MFA_REQUIRED",
  dataLoadFailed: "ERR_DATA_LOAD_FAILED",
  dataSaveFailed: "ERR_DATA_SAVE_FAILED",
  dataDeleteFailed: "ERR_DATA_DELETE_FAILED",
  unknown: "ERR_UNKNOWN",
} as const

export const errorMessages = {
  network:
    "Unable to reach the server. Please check your connection and try again.",
  timeout: "The request timed out. Please try again.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You do not have permission to perform this action.",
  notFound: "The requested resource could not be found.",
  validation: "Please check the submitted values and try again.",
  http: "The server returned an unexpected response.",
  unexpected: "Something went wrong. Please try again.",
  invalidCredentials:
    "The username or password you entered is incorrect.",
  termsRequired: "Please accept the terms to continue.",
  passwordMismatch: "Passwords do not match.",
  uploadFailed: "Upload failed. Please check your connection and try again.",
  uploadTooLarge: "This file is too large. The maximum size is 10 MB.",
  unsupportedType: "Please choose a PDF or DOCX file.",
  authNotConfigured:
    "Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment (see .env.example).",
  emailNotConfirmed:
    "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
  emailAlreadyRegistered:
    "An account with this email already exists. Try signing in instead.",
  weakPassword:
    "This password is too weak. Use at least 8 characters with a mix of letters and numbers.",
  samePassword: "Choose a password different from your current one.",
  rateLimited:
    "Too many attempts. Please wait a moment and try again.",
  mfaRequired: "Additional verification is required to continue.",
  dataLoadFailed:
    "Your data could not be loaded. Please refresh the page and try again.",
  dataSaveFailed:
    "Your change could not be saved. Please try again.",
  dataDeleteFailed:
    "The item could not be deleted. Please try again.",
} as const
