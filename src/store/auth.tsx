import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AUTH_SESSION, ROUTES, messages } from "@/constants"
import { logError, safeAsync } from "@/lib/async"
import { getSupabase } from "@/lib/supabase"
import { getOwnProfile, type Profile } from "@/services/profiles"
import { getSessionUser, signOut as signOutService } from "@/services/auth"
import type { AuthUser } from "@/services/auth"

/**
 * Authentication state machine (platform spec §53):
 *
 *   loading ──▶ unauthenticated ──▶ authenticated
 *                    ▲                    │
 *                    │                password ok,
 *                    │                MFA enrolled
 *                    └────────── mfaChallenge ──▶ (verify) ──▶ authenticated
 */
export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "authenticated"
  | "mfaChallenge"

type AuthValue = {
  /** Machine-readable authentication state; prefer over `user` checks. */
  status: AuthStatus
  user: AuthUser | null
  profile: Profile | null
  /** True while the first session lookup resolves (compat alias for status === "loading"). */
  loading: boolean
  refresh: () => Promise<AuthStatus>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

const RESET = {
  status: "unauthenticated" as const,
  user: null,
  profile: null,
}

/** Tracks the absolute session start so reloads do not reset the countdown.
 *  Only a timestamp lives here - never a token (platform spec §20). */
const SESSION_STARTED_AT_KEY = "dossier.session.startedAt"

function markSessionStart(): void {
  if (!localStorage.getItem(SESSION_STARTED_AT_KEY)) {
    localStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()))
  }
}

function clearSessionStart(): void {
  localStorage.removeItem(SESSION_STARTED_AT_KEY)
}

function sessionElapsedMs(): number {
  const startedAt = Number(localStorage.getItem(SESSION_STARTED_AT_KEY))
  if (!startedAt || Number.isNaN(startedAt)) return 0
  return Date.now() - startedAt
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const statusRef = useRef<AuthStatus>("loading")
  statusRef.current = status

  const navigate = useNavigate()

  /**
   * Re-derives the full state from the session: identity, account state and
   * authenticator assurance level (AAL). This is the single source of truth;
   * components must not re-implement this logic.
   */
  const evaluate = useCallback(async (): Promise<AuthStatus> => {
    const nextUser = await safeAsync(() => getSessionUser(), {
      context: "AuthProvider.evaluate.getSessionUser",
    })

    if (!nextUser) {
      clearSessionStart()
      setProfile(null)
      setUser(null)
      setStatus("unauthenticated")
      return "unauthenticated"
    }

    setUser(nextUser)

    // AAL check: an enrolled but unverified factor means a step-up challenge
    // is required before the session is considered fully authenticated.
    const assurance = await safeAsync(
      () => getSupabase().auth.mfa.getAuthenticatorAssuranceLevel(),
      { context: "AuthProvider.evaluate.assuranceLevel" }
    )
    const level = assurance?.data
    const needsMfa =
      level?.nextLevel === "aal2" && level.currentLevel !== "aal2"

    const ownProfile = await safeAsync(() => getOwnProfile(), {
      context: "AuthProvider.evaluate.profile",
    })
    setProfile(ownProfile)

    const nextStatus: AuthStatus = needsMfa ? "mfaChallenge" : "authenticated"

    // The absolute session window starts at sign-in; persisted so page
    // reloads cannot silently extend it.
    markSessionStart()

    setStatus(nextStatus)
    return nextStatus
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    void evaluate()

    try {
      const {
        data: { subscription },
      } = getSupabase().auth.onAuthStateChange((event) => {
        switch (event) {
          case "SIGNED_OUT":
            clearSessionStart()
            setStatus(RESET.status)
            setUser(RESET.user)
            setProfile(RESET.profile)
            break
          case "TOKEN_REFRESHED":
            // After an MFA challenge the token upgrade carries the new AAL;
            // only re-evaluate while a challenge is actually pending.
            if (statusRef.current === "mfaChallenge") void evaluate()
            break
          case "INITIAL_SESSION":
          case "SIGNED_IN":
          case "USER_UPDATED":
            void evaluate()
            break
          default:
            break
        }
      })
      unsubscribe = () => subscription.unsubscribe()
    } catch (error) {
      logError(error, "AuthProvider.subscribe")
      setStatus("unauthenticated")
    }

    return () => {
      unsubscribe?.()
    }
  }, [evaluate])

  const handleSignOut = useCallback(async () => {
    await safeAsync(async () => {
      await signOutService()
      clearSessionStart()
      setStatus(RESET.status)
      setUser(RESET.user)
      setProfile(RESET.profile)
    }, { context: "AuthProvider.signOut" })
  }, [])

  /**
   * Absolute session expiry (platform spec §21): after AUTH_SESSION.ttlMs the
   * user is signed out and returned to login regardless of activity. The
   * server enforces the same cap via [auth.sessions] timebox in config.toml;
   * this monitor provides deterministic UX on top of that guarantee.
   */
  useEffect(() => {
    if (status !== "authenticated" && status !== "mfaChallenge") return

    const interval = setInterval(() => {
      if (
        statusRef.current !== "authenticated" &&
        statusRef.current !== "mfaChallenge"
      ) {
        return
      }
      if (sessionElapsedMs() < AUTH_SESSION.ttlMs) return

      toast.info(messages.login.toasts.sessionExpired)
      void handleSignOut().then(() =>
        navigate(ROUTES.login, { replace: true })
      )
    }, AUTH_SESSION.checkIntervalMs)

    return () => clearInterval(interval)
  }, [status, handleSignOut, navigate])

  const value = useMemo(
    () => ({
      status,
      user,
      profile,
      loading: status === "loading",
      refresh: evaluate,
      signOut: handleSignOut,
    }),
    [status, user, profile, evaluate, handleSignOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return value
}
