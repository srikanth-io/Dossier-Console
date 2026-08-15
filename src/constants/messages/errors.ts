export const errorCodes = {
  network: "ERR_NETWORK",
  http: "ERR_HTTP",
  unauthorized: "ERR_UNAUTHORIZED",
  notFound: "ERR_NOT_FOUND",
  validation: "ERR_VALIDATION",
  timeout: "ERR_TIMEOUT",
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
} as const
