import { Button } from "@/components/ui/button"
import { ROUTES, icons, messages } from "@/constants"
import type { AccountStatus } from "@/services/profiles"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/store/auth"

/**
 * Rendered when a session exists but the account is not ACTIVE
 * (platform spec §23): authentication alone does not grant access.
 */
export function BlockedAccount({ status }: { status: AccountStatus }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const copy =
    messages.account.states[
      status as keyof typeof messages.account.states
    ] ?? null

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/15">
          <icons.lock className="size-6" />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {copy ? copy.title : messages.account.blockedTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {copy
            ? copy.description
            : messages.account.blockedFallback}
        </p>
        <Button variant="outline" className="mt-6 w-full" onClick={handleSignOut}>
          <icons.signOut className="size-4" />
          {messages.account.signOut}
        </Button>
      </div>
    </div>
  )
}
