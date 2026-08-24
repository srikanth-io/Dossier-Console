/**
 * Account profile persistence. Details edited in Settings → Account are kept
 * per-user in localStorage so they survive reloads without extra tables.
 */

const PREFIX = "dossier.account."

export type AccountProfile = {
  name: string
  phoneCode: string
  phone: string
  role: string
  department: string
  timezone: string
  bio: string
  website: string
  linkedin: string
  github: string
  twitter: string
}

export const EMPTY_ACCOUNT_PROFILE: AccountProfile = {
  name: "",
  phoneCode: "+91",
  phone: "",
  role: "",
  department: "",
  timezone: "",
  bio: "",
  website: "",
  linkedin: "",
  github: "",
  twitter: "",
}

function keyFor(userId?: string | null): string {
  return userId ? `${PREFIX}${userId}` : `${PREFIX}local`
}

export function loadAccountProfile(userId?: string | null): AccountProfile {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (!raw) return { ...EMPTY_ACCOUNT_PROFILE }
    const parsed = JSON.parse(raw) as Partial<AccountProfile>
    return { ...EMPTY_ACCOUNT_PROFILE, ...parsed }
  } catch {
    return { ...EMPTY_ACCOUNT_PROFILE }
  }
}

export function saveAccountProfile(
  profile: AccountProfile,
  userId?: string | null
): void {
  localStorage.setItem(keyFor(userId), JSON.stringify(profile))
}
