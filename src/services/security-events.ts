import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { safeAsync } from "@/lib/async"
import { AppError } from "@/lib/errors"
import { getSupabase } from "@/lib/supabase"
import { sendEmail, emailTemplates } from "@/lib/email"

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
  newDeviceLogin: "NEW_DEVICE_LOGIN",
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

/**
 * Send new device login notification email
 */
export async function sendNewDeviceLoginEmail(
  userEmail: string,
  userName: string,
  deviceInfo: {
    device: string
    ip: string
    location: string
    browser?: string
    os?: string
  }
): Promise<void> {
  const loginTime = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const template = emailTemplates.newDeviceLogin(
    userName,
    deviceInfo.device,
    deviceInfo.ip,
    deviceInfo.location,
    loginTime
  )

  await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
  })
}

/**
 * Send workspace invite email
 */
export async function sendWorkspaceInviteEmail(
  toEmail: string,
  inviterName: string,
  workspaceName: string,
  inviteUrl: string,
  accessLevel: string
): Promise<void> {
  const template = emailTemplates.workspaceInvite(
    inviterName,
    workspaceName,
    inviteUrl,
    accessLevel
  )

  await sendEmail({
    to: toEmail,
    subject: template.subject,
    html: template.html,
  })
}

/**
 * Send password changed notification email
 */
export async function sendPasswordChangedEmail(
  userEmail: string,
  userName: string,
  device: string,
  ip: string
): Promise<void> {
  const template = emailTemplates.passwordChanged(userName, device, ip)

  await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
  })
}

/**
 * Send MFA status change notification email
 */
export async function sendMfaStatusEmail(
  userEmail: string,
  userName: string,
  enabled: boolean,
  device: string,
  ip: string
): Promise<void> {
  const template = emailTemplates.mfaStatusChanged(userName, enabled, device, ip)

  await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
  })
}
