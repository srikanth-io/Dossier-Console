/**
 * Local profile-photo storage. Photos live in localStorage as data URLs so no
 * storage bucket or migration is required; keys are per-user.
 */

const PREFIX = "dossier.avatar."
const FALLBACK_KEY = `${PREFIX}local`
/** Keep data URLs small enough for localStorage (~5MB budget). */
export const MAX_AVATAR_BYTES = 512 * 1024

function keyFor(userId?: string | null): string {
  return userId ? `${PREFIX}${userId}` : FALLBACK_KEY
}

/** Fired on window whenever any stored avatar changes, so other mounted
 *  components (e.g. the sidebar profile) can re-read their value. */
const AVATAR_CHANGED_EVENT = "dossier:avatar-changed"

export function notifyAvatarChanged(): void {
  window.dispatchEvent(new Event(AVATAR_CHANGED_EVENT))
}

export function onAvatarChanged(handler: () => void): () => void {
  window.addEventListener(AVATAR_CHANGED_EVENT, handler)
  return () => window.removeEventListener(AVATAR_CHANGED_EVENT, handler)
}

export function getStoredAvatar(userId?: string | null): string | null {
  try {
    return localStorage.getItem(keyFor(userId))
  } catch {
    return null
  }
}

export function setStoredAvatar(dataUrl: string, userId?: string | null): void {
  localStorage.setItem(keyFor(userId), dataUrl)
  notifyAvatarChanged()
}

export function removeStoredAvatar(userId?: string | null): void {
  try {
    localStorage.removeItem(keyFor(userId))
    notifyAvatarChanged()
  } catch {
    // Storage unavailable (private mode) — nothing to clean up.
  }
}
