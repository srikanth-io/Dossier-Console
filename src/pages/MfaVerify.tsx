import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Meteors } from "@/components/ui/meteors"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { APP, ROUTES, icons, messages } from "@/constants"
import { errorCodes } from "@/constants/messages/errors"
import { getErrorMessage, safeAsync } from "@/lib/async"
import { AppError } from "@/lib/errors"
import { listMfaFactors, verifyMfaCode } from "@/services/auth"
import { useAuth } from "@/store/auth"

export function MfaVerify() {
  const navigate = useNavigate()
  const { user, refresh } = useAuth()
  const [method, setMethod] = useState("totp")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.login, { replace: true })
      return
    }

    void safeAsync(async () => {
      const factors = await listMfaFactors()
      if (factors.length === 0) {
        navigate(ROUTES.app, { replace: true })
      }
    }, { context: "MfaVerify.loadFactors" })
  }, [user, navigate])

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (code.length !== 6) {
      setError(messages.login.mfaVerifyPage.invalidCode)
      return
    }

    setLoading(true)
    const ok = await safeAsync(() => verifyMfaCode(code), {
      context: "MfaVerify.verify",
      onError: (err) =>
        setError(
          err instanceof AppError && err.code === errorCodes.validation
            ? messages.login.mfaVerifyPage.invalidCode
            : getErrorMessage(err)
        ),
    })
    setLoading(false)

    if (ok) {
      await refresh()
      navigate(ROUTES.app, { replace: true })
    }
  }

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="relative hidden w-[44%] shrink-0 overflow-hidden bg-gradient-brand lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-32 size-[480px] rounded-full bg-white/10 blur-[120px]" />
          <div className="absolute -right-24 -bottom-32 size-[420px] rounded-full bg-white/10 blur-[110px]" />
        </div>
        <Meteors number={20} />
        <div className="relative flex flex-1 flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
              <icons.brand className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="font-heading text-lg font-bold text-white">{APP.name}</p>
              <p className="text-xs font-medium tracking-wide text-white/70 uppercase">{APP.console}</p>
            </div>
          </div>
          <div>
            <h2 className="max-w-md font-heading text-3xl leading-tight font-bold tracking-tight text-white xl:text-4xl">
              {APP.tagline}
            </h2>
          </div>
          <p className="text-xs text-white/60">{messages.login.copyright(new Date().getFullYear())}</p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <icons.brand className="size-6" />
            </div>
            <p className="mt-3 font-heading text-xl font-bold">{APP.name}</p>
          </div>

          <div className="w-full rounded-3xl border border-border/80 bg-card p-8 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary-soft/70 text-primary dark:bg-primary/15">
                <icons.shield className="size-6" />
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                {messages.login.mfaVerifyPage.title}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {messages.login.mfaVerifyPage.subtitle}
              </p>
            </div>

            <Tabs value={method} onValueChange={setMethod} className="mb-6">
              <TabsList className="grid h-12 w-full grid-cols-2 gap-1 rounded-full bg-muted p-1">
                <TabsTrigger
                  value="totp"
                  className="h-full rounded-full data-[slot=tabs-trigger]:data-[state=active]:bg-primary-soft data-[slot=tabs-trigger]:data-[state=active]:text-primary data-[slot=tabs-trigger]:data-[state=active]:shadow-none"
                >
                  {messages.login.mfaVerifyPage.totpTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="email"
                  className="h-full rounded-full data-[slot=tabs-trigger]:data-[state=active]:bg-primary-soft data-[slot=tabs-trigger]:data-[state=active]:text-primary data-[slot=tabs-trigger]:data-[state=active]:shadow-none"
                >
                  {messages.login.mfaVerifyPage.emailTitle}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleVerify} className="space-y-4">
              {method === "totp" && (
                <div className="space-y-2">
                  <Label htmlFor="totp-code">
                    {messages.login.mfaVerifyPage.totpTitle}
                  </Label>
                  <div className="relative">
                    <icons.shield className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="totp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, ""))
                        setError(null)
                      }}
                      className="h-12 pl-11 text-center text-lg tracking-[0.3em] font-mono"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {method === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="email-code">
                    {messages.login.mfaVerifyPage.emailTitle}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {messages.login.mfaVerifyPage.emailSubtitle} {user?.email}
                  </p>
                  <div className="relative">
                    <icons.mail className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, ""))
                        setError(null)
                      }}
                      className="h-12 pl-11 text-center text-lg tracking-[0.3em] font-mono"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => {}}
                  >
                    {messages.login.mfaVerifyPage.resendCode}
                  </button>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="h-12 w-full text-base"
              >
                {loading
                  ? messages.login.mfaVerifyPage.verifying
                  : messages.login.mfaVerifyPage.verifyButton}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {messages.login.copyright(new Date().getFullYear())}
          </p>
        </div>
      </main>
    </div>
  )
}
