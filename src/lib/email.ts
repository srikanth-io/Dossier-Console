/**
 * Email Service Configuration
 * 
 * This module provides email sending capabilities using Mailcow/SMTP.
 * For local development, it uses the Mailcow Docker container.
 * For production, update the SMTP settings accordingly.
 */

export type EmailConfig = {
  host: string
  port: number
  secure: boolean
  auth?: {
    user: string
    pass: string
  }
}

export type EmailMessage = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export type EmailTemplate = {
  name: string
  subject: string
  html: string
}

// Default SMTP configuration for Mailcow
export const emailConfig: EmailConfig = {
  host: import.meta.env.VITE_SMTP_HOST || "127.0.0.1",
  port: parseInt(import.meta.env.VITE_SMTP_PORT || "587", 10),
  secure: import.meta.env.VITE_SMTP_SECURE === "true",
  auth: {
    user: import.meta.env.VITE_SMTP_USER || "admin@dossier.local",
    pass: import.meta.env.VITE_SMTP_PASS || "admin",
  },
}

// Email sender defaults
export const emailDefaults = {
  from: import.meta.env.VITE_EMAIL_FROM || "Dossier Admin <noreply@dossier.local>",
  replyTo: import.meta.env.VITE_EMAIL_REPLY_TO || "support@dossier.local",
}

/**
 * Generate unified email HTML wrapper with logo and styling
 */
export function wrapEmailTemplate(content: string, options?: { preheader?: string }): string {
  const preheader = options?.preheader || ""
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Dossier Admin</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center; }
    .logo { width: 48px; height: 48px; background: white; border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 24px; font-weight: 700; color: #6366f1; }
    .content { padding: 32px 24px; }
    .title { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 16px; }
    .text { font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px; }
    .button { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 15px; }
    .button:hover { background: #4f46e5; }
    .button-secondary { background: transparent; color: #6366f1 !important; border: 1px solid #e2e8f0; }
    .button-secondary:hover { background: #f8fafc; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .info-box { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .info-label { font-size: 12px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .info-value { font-size: 14px; color: #0f172a; font-weight: 500; }
    .code { font-family: 'SF Mono', Monaco, monospace; font-size: 32px; font-weight: 700; color: #6366f1; letter-spacing: 8px; text-align: center; padding: 24px; background: #f8fafc; border-radius: 8px; margin: 24px 0; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; }
    .footer-text { font-size: 13px; color: #94a3b8; margin: 0; }
    .footer-link { color: #64748b; text-decoration: underline; }
    .device-info { background: #fff7ed; border-left: 4px solid #f97316; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .device-info.warning { background: #fef2f2; border-left-color: #ef4444; }
  </style>
</head>
<body>
  <div style="padding: 24px; background: #f8fafc;">
    <div class="container">
      <div class="header">
        <div class="logo">
          <span class="logo-text">DA</span>
        </div>
        <h1 style="color: white; font-size: 18px; font-weight: 600; margin: 0;">Dossier Admin</h1>
      </div>
      <div class="content">
        ${preheader ? `<p style="display: none; max-height: 0; overflow: hidden;">${preheader}</p>` : ""}
        ${content}
      </div>
      <div class="footer">
        <p class="footer-text">
          This email was sent by <a href="#" class="footer-link">Dossier Admin</a>.
        </p>
        <p class="footer-text" style="margin-top: 8px;">
          <a href="#" class="footer-link">Manage notifications</a> · 
          <a href="#" class="footer-link">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Email Templates
 */
export const emailTemplates = {
  // Welcome email after registration
  welcome: (name: string, confirmUrl: string): EmailTemplate => ({
    name: "welcome",
    subject: "Welcome to Dossier Admin",
    html: wrapEmailTemplate(`
      <h2 class="title">Welcome to Dossier Admin! 🎉</h2>
      <p class="text">
        Hi ${name},<br><br>
        Your account has been created successfully. You're now part of a powerful workspace for managing dossiers, documents, and team collaboration.
      </p>
      <p class="text">
        To get started, please verify your email address by clicking the button below:
      </p>
      <p style="text-align: center;">
        <a href="${confirmUrl}" class="button">Verify Email Address</a>
      </p>
      <p class="text" style="font-size: 13px; color: #94a3b8;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    `, { preheader: "Verify your email to get started with Dossier Admin" }),
  }),

  // Email confirmation
  confirmEmail: (name: string, confirmUrl: string): EmailTemplate => ({
    name: "confirm-email",
    subject: "Confirm your email address",
    html: wrapEmailTemplate(`
      <h2 class="title">Confirm your email</h2>
      <p class="text">
        Hi ${name},<br><br>
        Please confirm your email address by clicking the button below:
      </p>
      <p style="text-align: center;">
        <a href="${confirmUrl}" class="button">Confirm Email</a>
      </p>
      <p class="text" style="font-size: 13px; color: #94a3b8;">
        This link will expire in 24 hours.
      </p>
    `, { preheader: "Confirm your email to continue using Dossier Admin" }),
  }),

  // Password reset
  passwordReset: (name: string, resetUrl: string): EmailTemplate => ({
    name: "password-reset",
    subject: "Reset your password",
    html: wrapEmailTemplate(`
      <h2 class="title">Password Reset Request</h2>
      <p class="text">
        Hi ${name},<br><br>
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      <p class="text" style="font-size: 13px; color: #94a3b8;">
        If you didn't request this, you can safely ignore this email. Your password won't change until you create a new one.
      </p>
    `, { preheader: "Reset your Dossier Admin password" }),
  }),

  // New device login notification
  newDeviceLogin: (name: string, device: string, ip: string, location: string, loginTime: string): EmailTemplate => ({
    name: "new-device-login",
    subject: "New device signed in to your account",
    html: wrapEmailTemplate(`
      <h2 class="title">New Device Sign-in</h2>
      <p class="text">
        Hi ${name},<br><br>
        We detected a new device signing in to your account. Here are the details:
      </p>
      <div class="device-info warning">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 24px;">🖥️</span>
          <div>
            <p class="info-label">Device</p>
            <p class="info-value">${device}</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <p class="info-label">IP Address</p>
            <p class="info-value">${ip}</p>
          </div>
          <div>
            <p class="info-label">Location</p>
            <p class="info-value">${location}</p>
          </div>
          <div>
            <p class="info-label">Time</p>
            <p class="info-value">${loginTime}</p>
          </div>
        </div>
      </div>
      <p class="text">
        If this was you, no further action is required. If you don't recognize this activity, please secure your account immediately.
      </p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="#" class="button">Secure My Account</a>
      </p>
    `, { preheader: "New device signed in to your Dossier Admin account" }),
  }),

  // Workspace invite
  workspaceInvite: (inviterName: string, workspaceName: string, inviteUrl: string, accessLevel: string): EmailTemplate => ({
    name: "workspace-invite",
    subject: `${inviterName} invited you to join ${workspaceName}`,
    html: wrapEmailTemplate(`
      <h2 class="title">You're invited to join a workspace</h2>
      <p class="text">
        Hi,<br><br>
        <strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on Dossier Admin.
      </p>
      <div class="info-box">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <p class="info-label">Workspace</p>
            <p class="info-value">${workspaceName}</p>
          </div>
          <div>
            <p class="info-label">Access Level</p>
            <p class="info-value">${accessLevel}</p>
          </div>
        </div>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${inviteUrl}" class="button">Accept Invitation</a>
      </p>
      <p class="text" style="font-size: 13px; color: #94a3b8;">
        If you don't have an account yet, you'll be prompted to create one.
      </p>
    `, { preheader: `Join ${workspaceName} on Dossier Admin` }),
  }),

  // Password changed confirmation
  passwordChanged: (name: string, device: string, ip: string): EmailTemplate => ({
    name: "password-changed",
    subject: "Your password was changed",
    html: wrapEmailTemplate(`
      <h2 class="title">Password Changed</h2>
      <p class="text">
        Hi ${name},<br><br>
        Your password was successfully changed. Here are the details:
      </p>
      <div class="info-box">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <p class="info-label">Device</p>
            <p class="info-value">${device}</p>
          </div>
          <div>
            <p class="info-label">IP Address</p>
            <p class="info-value">${ip}</p>
          </div>
        </div>
      </div>
      <p class="text">
        If you didn't make this change, please contact our support team immediately.
      </p>
    `, { preheader: "Your Dossier Admin password was changed" }),
  }),

  // MFA enabled/disabled
  mfaStatusChanged: (name: string, enabled: boolean, device: string, ip: string): EmailTemplate => ({
    name: "mfa-status",
    subject: enabled ? "MFA enabled on your account" : "MFA disabled on your account",
    html: wrapEmailTemplate(`
      <h2 class="title">${enabled ? "MFA Enabled" : "MFA Disabled"}</h2>
      <p class="text">
        Hi ${name},<br><br>
        Multi-factor authentication was ${enabled ? "enabled" : "disabled"} on your account. Here are the details:
      </p>
      <div class="info-box">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <p class="info-label">Action</p>
            <p class="info-value">${enabled ? "MFA Enabled" : "MFA Disabled"}</p>
          </div>
          <div>
            <p class="info-label">Device</p>
            <p class="info-value">${device}</p>
          </div>
          <div>
            <p class="info-label">IP Address</p>
            <p class="info-value">${ip}</p>
          </div>
        </div>
      </div>
      <p class="text">
        ${enabled 
          ? "Your account is now more secure. You'll need your authenticator app to sign in." 
          : "Your account security has been reduced. Consider re-enabling MFA for better protection."}
      </p>
    `, { preheader: `MFA ${enabled ? "enabled" : "disabled"} on your Dossier Admin account` }),
  }),
}

/**
 * Send email using the send-email edge function → SMTP relay (Mailpit in local dev).
 */
export async function sendEmail(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL?.trim()}/functions/v1/send-email`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || "",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || ""}`,
      },
      body: JSON.stringify({
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        from: message.from || emailDefaults.from,
        replyTo: message.replyTo || emailDefaults.replyTo,
      }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return { success: false, error: body.error || `HTTP ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error("[Email Service] Failed to send email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Send a specific email template
 */
export async function sendEmailTemplate(
  templateName: keyof typeof emailTemplates,
  args: unknown[]
): Promise<{ success: boolean; error?: string }> {
  const templateFn = emailTemplates[templateName] as (...args: unknown[]) => EmailTemplate
  const template = templateFn(...args)
  return sendEmail({
    to: "", // Will be filled by caller
    subject: template.subject,
    html: template.html,
  })
}
