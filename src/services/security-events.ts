import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { safeAsync } from "@/lib/async"
import { AppError } from "@/lib/errors"
import { getSupabase } from "@/lib/supabase"

/** Audit event types persisted in public.security_events (spec §38). */
export const securityEventTypes = {
  loginSuccess: "LOGIN_SUCCESS",
  loginFailure: "LOGIN_FAILURE",
  logout: "LOGOUT",
  accountCreated: "ACCOUNT_CREATED",
  passwordChanged: "PASSWORD_CHANGED",
  passwordResetRequested: "PASSWORD_RESET_REQUESTED",
  passwordResetCompleted: "PASSWORD_RESET_COMPLETED",
  mfaVerified: "MFA_VERIFIED",
  mfaFailed: "MFA_FAILED",
} as const

export type SecurityEventType =
  (typeof securityEventTypes)[keyof typeof securityEventTypes]

/**
 * Fire-and-forget audit write. Never throws into the caller's flow: the
 * database function itself swallows failures and RLS/function grants are the
 * only path to insert rows. user_id is derived server-side from the JWT.
 */
export async function recordSecurityEvent(
  eventType: SecurityEventType,
  options?: { success?: boolean; metadata?: Record<string, unknown> }
): Promise<void> {
  await safeAsync(
    async () => {
      const { error } = await getSupabase().rpc("log_security_event", {
        p_event_type: eventType,
        p_success: options?.success ?? true,
        p_metadata: options?.metadata ?? {},
      })
      if (error) {
        throw new AppError(errorCodes.http, errorMessages.http, {
          cause: error.message,
        })
      }
    },
    { context: `securityEvents.record(${eventType})` }
  )
}
