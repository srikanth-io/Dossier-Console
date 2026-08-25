import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { FormField } from "@/components/common/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Meteors } from "@/components/ui/meteors"
import { APP, ROUTES, icons, messages } from "@/constants"
import { getErrorMessage, safeAsync } from "@/lib/async"
import { requestPasswordReset, updatePassword } from "@/services/auth"
import { useAuth } from "@/store/auth"

function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggle,
  autoComplete = "new-password",
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  showPassword: boolean
  onToggle: () => void
  autoComplete?: string
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="h-12 pr-12 text-base"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-1.5 size-9 -translate-y-1/2 text-muted-foreground"
        aria-label={showPassword ? messages.login.hidePassword : messages.login.showPassword}
        onClick={onToggle}
      >
        {showPassword ? (
          <icons.eyeOff className="size-5" />
        ) : (
          <icons.eye className="size-5" />
        )}
      </Button>
    </div>
  )
}

import { errorMessages } from "@/constants/messages/errors"

export function ForgotPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const isResetMode = location.pathname === ROUTES.resetPassword

  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  async function handleRequestReset(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    await safeAsync(() => requestPasswordReset(email), {
      context: "ForgotPage.requestReset",
      onError: (err) => setError(getErrorMessage(err)),
    })

    setLoading(false)
    setSent(true)
  }

  async function handleSetNewPassword(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmNewPassword) {
      setError(errorMessages.passwordMismatch)
      return
    }

    setLoading(true)

    const ok = await safeAsync(() => updatePassword(newPassword), {
      context: "ForgotPage.updatePassword",
      onError: (err) => setError(getErrorMessage(err)),
    })

    setLoading(false)

    if (ok) {
      await signOut()
      navigate(ROUTES.login, { replace: true })
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
                <icons.lock className="size-6" />
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                {isResetMode
                  ? messages.login.resetPasswordPage.title
                  : messages.login.forgotPasswordPage.title}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {isResetMode
                  ? messages.login.resetPasswordPage.subtitle
                  : messages.login.forgotPasswordPage.subtitle}
              </p>
            </div>

            {isResetMode ? (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <FormField
                  label={messages.login.resetPasswordPage.newPasswordLabel}
                  htmlFor="new-password"
                  required
                >
                  <PasswordField
                    id="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder={messages.login.resetPasswordPage.newPasswordPlaceholder}
                    showPassword={showNewPassword}
                    onToggle={() => setShowNewPassword((show) => !show)}
                    autoComplete="new-password"
                  />
                </FormField>

                <FormField
                  label={messages.login.resetPasswordPage.confirmPasswordLabel}
                  htmlFor="confirm-new-password"
                  required
                >
                  <PasswordField
                    id="confirm-new-password"
                    value={confirmNewPassword}
                    onChange={setConfirmNewPassword}
                    placeholder={messages.login.resetPasswordPage.confirmPasswordPlaceholder}
                    showPassword={showConfirmNewPassword}
                    onToggle={() => setShowConfirmNewPassword((show) => !show)}
                    autoComplete="new-password"
                  />
                </FormField>

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
                    ? messages.login.resetPasswordPage.resetting
                    : messages.login.resetPasswordPage.resetButton}
                </Button>
              </form>
            ) : sent ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <icons.checkCircle className="size-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {messages.login.forgotPasswordPage.success}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to={ROUTES.login}>
                    <icons.arrowLeft className="size-4" /> {messages.login.forgotPasswordPage.backToLogin}
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <FormField
                  label={messages.login.forgotPasswordPage.emailLabel}
                  htmlFor="forgot-email"
                  required
                >
                  <div className="relative">
                    <icons.mail className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      placeholder={messages.login.forgotPasswordPage.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 pl-11 text-base"
                    />
                  </div>
                </FormField>

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="h-12 w-full text-base"
                >
                  {loading
                    ? messages.login.forgotPasswordPage.sending
                    : messages.login.forgotPasswordPage.sendLink}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link to={ROUTES.login}>
                    <icons.arrowLeft className="size-4" /> {messages.login.forgotPasswordPage.backToLogin}
                  </Link>
                </Button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {messages.login.copyright(new Date().getFullYear())}
          </p>
        </div>
      </main>
    </div>
  )
}
