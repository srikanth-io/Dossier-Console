/** Human-readable copy + badge categories for security_events rows. */

export type SecurityEventCategory =
  | "login"
  | "security"
  | "settings"
  | "timesheet"
  | "system"

export const securityEventLabels: Record<string, string> = {
  LOGIN_SUCCESS: "Signed in",
  LOGIN_FAILURE: "Failed sign-in attempt",
  LOGOUT: "Signed out",
  ACCOUNT_CREATED: "Account created",
  PASSWORD_CHANGED: "Password changed",
  PASSWORD_RESET_REQUESTED: "Password reset requested",
  PASSWORD_RESET_COMPLETED: "Password reset completed",
  EMAIL_VERIFIED: "Email verified",
  MFA_ENROLLED: "MFA enabled",
  MFA_VERIFIED: "MFA verified",
  MFA_FAILED: "MFA verification failed",
  MFA_REMOVED: "MFA disabled",
  SESSION_REVOKED: "Session revoked",
  ACCOUNT_LOCKED: "Account locked",
  ACCOUNT_SUSPENDED: "Account suspended",
}

export const securityEventCategories: Record<string, SecurityEventCategory> = {
  LOGIN_SUCCESS: "login",
  LOGIN_FAILURE: "login",
  LOGOUT: "login",
  MFA_ENROLLED: "security",
  MFA_VERIFIED: "security",
  MFA_FAILED: "security",
  MFA_REMOVED: "security",
  SESSION_REVOKED: "security",
  ACCOUNT_LOCKED: "security",
  ACCOUNT_SUSPENDED: "security",
  PASSWORD_CHANGED: "settings",
  PASSWORD_RESET_REQUESTED: "settings",
  PASSWORD_RESET_COMPLETED: "settings",
  EMAIL_VERIFIED: "settings",
  ACCOUNT_CREATED: "system",
}

export function securityEventLabel(eventType: string): string {
  return securityEventLabels[eventType] ?? "Security event"
}

export function securityEventCategory(
  eventType: string
): SecurityEventCategory {
  return securityEventCategories[eventType] ?? "security"
}
