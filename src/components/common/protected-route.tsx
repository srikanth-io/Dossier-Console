import type { ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { LoaderCircleIcon } from "@/components/icons/loader-circle"
import { ROUTES } from "@/constants"
import { BlockedAccount } from "@/components/common/blocked-account"
import { useAuth } from "@/store/auth"

function AuthGateFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

/**
 * Renders children only for an authenticated session whose account is ACTIVE
 * (platform spec §23/§55). Route guards are UX protection; authorization is
 * still enforced server-side by RLS.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthGateFallback />
  if (!user) {
    return (
      <Navigate
        to={ROUTES.login}
        state={{ from: location.pathname }}
        replace
      />
    )
  }
  // Unknown profile (row missing or transient fetch failure) stays permitted;
  // known non-ACTIVE states are blocked.
  if (profile && profile.accountStatus !== "ACTIVE") {
    return <BlockedAccount status={profile.accountStatus} />
  }
  return <>{children}</>
}

/** Layout route: renders nested routes only while unauthenticated or mid-MFA challenge. */
export function RedirectIfAuthenticated() {
  const { user, loading, status } = useAuth()

  if (loading) return <AuthGateFallback />
  if (user && status !== "mfaChallenge") {
    return <Navigate to={ROUTES.app} replace />
  }
  return <Outlet />
}

/**
 * Guards the step-up route: reachable only while a challenge is pending
 * between password success and TOTP verification (platform spec §16).
 */
export function RequireMfaChallenge({ children }: { children: ReactNode }) {
  const { user, loading, status } = useAuth()

  if (loading) return <AuthGateFallback />
  if (!user) return <Navigate to={ROUTES.login} replace />
  if (status !== "mfaChallenge") {
    return <Navigate to={ROUTES.app} replace />
  }
  return <>{children}</>
}
