import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { assertAsync } from "@/lib/async"
import { AppError } from "@/lib/errors"
import { getSupabase } from "@/lib/supabase"
import {
  recordSecurityEvent,
  securityEventTypes,
} from "@/services/security-events"

export type AuthUser = {
  id: string
  email: string
  name: string
  username: string
}

export type SignUpResult = {
  user: AuthUser | null
  /** True when the server requires email confirmation before a session exists. */
  needsEmailConfirmation: boolean
}

export type MfaFactor = {
  id: string
  type: string
}

/** Maps Supabase Auth failures onto our stable error codes + constant copy. */
function mapAuthError(error: unknown): AppError {
  if (error instanceof AppError) return error

  const raw = error as { code?: string; message?: string; status?: number }
  const code = raw?.code ?? ""
  const status = raw?.status
  const message = (raw?.message ?? "").toLowerCase()

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return new AppError(errorCodes.unauthorized, errorMessages.invalidCredentials)
  }
  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return new AppError(errorCodes.emailNotConfirmed, errorMessages.emailNotConfirmed)
  }
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("user already exists")
  ) {
    return new AppError(
      errorCodes.emailAlreadyRegistered,
      errorMessages.emailAlreadyRegistered
    )
  }
  if (
    code === "weak_password" ||
    message.includes("password should be")
  ) {
    return new AppError(errorCodes.weakPassword, errorMessages.weakPassword)
  }
  if (
    code === "same_password" ||
    message.includes("different from the old password")
  ) {
    return new AppError(errorCodes.samePassword, errorMessages.samePassword)
  }
  // Generic validation failure (HTTP 422) once specific causes are excluded.
  if (status === 422) {
    return new AppError(
      errorCodes.emailAlreadyRegistered,
      errorMessages.emailAlreadyRegistered
    )
  }
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    message.includes("rate limit")
  ) {
    return new AppError(errorCodes.rateLimited, errorMessages.rateLimited)
  }
  if (message.includes("failed to fetch") || message.includes("network")) {
    return new AppError(errorCodes.network, errorMessages.network)
  }

  return new AppError(errorCodes.unknown, errorMessages.unexpected, {
    cause: raw?.message,
  })
}

type Metadata = Record<string, unknown>

export function toAuthUser(metadata: {
  id: string
  email?: string | null
  user_metadata?: Metadata
}): AuthUser {
  const meta = metadata.user_metadata ?? {}
  const name = typeof meta.name === "string" ? meta.name : ""
  const username = typeof meta.username === "string" ? meta.username : ""
  return {
    id: metadata.id,
    email: metadata.email ?? "",
    name: name || username || (metadata.email ?? "").split("@")[0],
    username,
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  return assertAsync(async () => {
    const { data, error } = await getSupabase().auth.getSession()
    if (error) throw mapAuthError(error)
    const session = data.session
    return session?.user ? toAuthUser(session.user) : null
  }, "auth.getSessionUser")
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthUser> {
  return assertAsync(async () => {
    if (!email.trim() || !password) {
      throw new AppError(errorCodes.validation, errorMessages.validation)
    }

    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      const mapped = mapAuthError(error)
      void recordSecurityEvent(securityEventTypes.loginFailure, {
        success: false,
        metadata: { reason: mapped.code },
      })
      throw mapped
    }

    void recordSecurityEvent(securityEventTypes.loginSuccess)
    return toAuthUser(data.user)
  }, "auth.signIn")
}

export async function signUp(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<SignUpResult> {
  return assertAsync(async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      throw new AppError(errorCodes.validation, errorMessages.validation)
    }

    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim(), username: username.trim() },
      },
    })
    if (error) throw mapAuthError(error)

    void recordSecurityEvent(securityEventTypes.accountCreated)
    return {
      user: data.user ? toAuthUser(data.user) : null,
      needsEmailConfirmation: data.session === null && data.user !== null,
    }
  }, "auth.signUp")
}

export async function signOut(): Promise<void> {
  return assertAsync(async () => {
    const { error } = await getSupabase().auth.signOut()
    void recordSecurityEvent(securityEventTypes.logout)
    if (error) throw mapAuthError(error)
  }, "auth.signOut")
}

export async function requestPasswordReset(email: string): Promise<void> {
  return assertAsync(async () => {
    if (!email.trim()) {
      throw new AppError(errorCodes.validation, errorMessages.validation)
    }

    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await getSupabase().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo }
    )
    if (error) throw mapAuthError(error)

    void recordSecurityEvent(securityEventTypes.passwordResetRequested)
  }, "auth.requestPasswordReset")
}

export async function updatePassword(newPassword: string): Promise<void> {
  return assertAsync(async () => {
    if (!newPassword) {
      throw new AppError(errorCodes.validation, errorMessages.validation)
    }

    const { error } = await getSupabase().auth.updateUser({
      password: newPassword,
    })
    if (error) throw mapAuthError(error)

    void recordSecurityEvent(securityEventTypes.passwordResetCompleted)
  }, "auth.updatePassword")
}

export async function listMfaFactors(): Promise<MfaFactor[]> {
  return assertAsync(async () => {
    const { data, error } = await getSupabase().auth.mfa.listFactors()
    if (error) throw mapAuthError(error)

    return data.all
      .filter((factor) => factor.status === "verified")
      .map((factor) => ({ id: factor.id, type: factor.factor_type }))
  }, "auth.listMfaFactors")
}

export async function verifyMfaCode(code: string): Promise<void> {
  return assertAsync(async () => {
    if (!/^\d{6}$/.test(code)) {
      throw new AppError(errorCodes.validation, errorMessages.validation)
    }

    const factors = await listMfaFactors()
    const totp = factors.find((factor) => factor.type === "totp")
    if (!totp) {
      throw new AppError(errorCodes.notFound, errorMessages.notFound)
    }

    const { error } = await getSupabase().auth.mfa.challengeAndVerify({
      factorId: totp.id,
      code,
    })
    if (error) {
      void recordSecurityEvent(securityEventTypes.mfaFailed, {
        success: false,
        metadata: { reason: mapAuthError(error).code },
      })
      throw mapAuthError(error)
    }

    void recordSecurityEvent(securityEventTypes.mfaVerified)
  }, "auth.verifyMfaCode")
}
