import { messages } from "@/constants"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,30}$/

export function validateName(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return messages.login.validation.nameRequired
  if (trimmed.length < 2) return messages.login.validation.nameTooShort
  return null
}

export function validateUsername(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return messages.login.validation.usernameRequired
  if (!USERNAME_PATTERN.test(trimmed)) {
    return messages.login.validation.usernameInvalid
  }
  return null
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return messages.login.validation.emailRequired
  if (!EMAIL_PATTERN.test(trimmed)) {
    return messages.login.validation.emailInvalid
  }
  return null
}

/** Mirrors the server policy: min 8 chars with at least one letter and digit. */
export function validatePassword(value: string): string | null {
  if (!value) return messages.login.validation.passwordRequired
  if (value.length < 8) return messages.login.validation.passwordTooShort
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    return messages.login.validation.passwordWeak
  }
  return null
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): string | null {
  if (!confirm) return messages.login.validation.confirmRequired
  if (password !== confirm) return messages.login.validation.passwordMismatch
  return null
}

export type PasswordStrength = {
  /** 0..4 */
  score: number
  label: string
}

/**
 * Heuristic strength score used purely for UX feedback; the authoritative
 * policy is enforced by Supabase Auth server-side.
 */
export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return { score: -1, label: "" }

  let points = 0
  if (value.length >= 8) points += 1
  if (value.length >= 12) points += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) points += 1
  if (/\d/.test(value)) points += 1
  if (/[^a-zA-Z0-9]/.test(value)) points += 1

  const labels = messages.login.validation.strengthLabels
  const score = Math.min(4, Math.max(0, points - 1))
  return { score, label: labels[score] ?? labels[0] }
}
