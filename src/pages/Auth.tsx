import { useMemo, useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { FormField } from "@/components/common/form-field"
import { BlurFade } from "@/components/ui/blur-fade"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Meteors } from "@/components/ui/meteors"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { APP, ROUTES, icons, messages } from "@/constants"
import {
  errorCodes,
  errorMessages,
} from "@/constants/messages/errors"
import { AppError } from "@/lib/errors"
import { getErrorMessage, safeAsync } from "@/lib/async"
import {
  getPasswordStrength,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validateUsername,
} from "@/lib/validation"
import { signIn, signUp } from "@/services/auth"
import { useAuth } from "@/store/auth"

function BrandPanel() {
  return (
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
            <p className="text-xs font-medium tracking-wide text-white/70 uppercase">
              {APP.console}
            </p>
          </div>
        </div>

        <div>
          <h2 className="max-w-md font-heading text-3xl leading-tight font-bold tracking-tight text-white xl:text-4xl">
            {APP.tagline}
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
            {messages.login.brand.subtitle}
          </p>

          <figure className="mt-10 max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
            <icons.sparkles className="size-5 text-white/80" />
            <blockquote className="mt-4 text-base leading-relaxed text-white/90">
              “{messages.login.testimonial.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25">
                <icons.user className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {messages.login.testimonial.author}
                </p>
                <p className="text-xs text-white/70">
                  {messages.login.testimonial.role}
                </p>
              </div>
            </figcaption>
          </figure>
        </div>

        <p className="text-xs text-white/60">
          {messages.login.copyright(new Date().getFullYear())}
        </p>
      </div>
    </aside>
  )
}

function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggle,
  invalid,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  showPassword: boolean
  onToggle: () => void
  invalid?: boolean
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        autoComplete={id === "signin-password" ? "current-password" : "new-password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        aria-invalid={invalid || undefined}
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

function strengthTone(score: number) {
  if (score <= 1) return { variant: "default", label: "text-destructive" } as const
  if (score <= 2)
    return { variant: "warning", label: "text-amber-600 dark:text-amber-500" } as const
  return {
    variant: "success",
    label: "text-emerald-600 dark:text-emerald-500",
  } as const
}

export function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location
  const activeTab = pathname === ROUTES.register ? "signup" : "signin"
  const { refresh } = useAuth()

  const [signInError, setSignInError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInEmail, setSignInEmail] = useState("")
  const [signInEmailTouched, setSignInEmailTouched] = useState(false)
  const [signInPasswordTouched, setSignInPasswordTouched] = useState(false)
  const [signInPassword, setSignInPassword] = useState("")
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const [name, setName] = useState("")
  const [signUpUsername, setSignUpUsername] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSignUp, setAttemptedSignUp] = useState(false)
  const [serverEmailError, setServerEmailError] = useState<string | null>(null)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showConfirmationNotice, setShowConfirmationNotice] = useState(false)

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const signUpErrors = useMemo(
    () => ({
      name: validateName(name),
      username: validateUsername(signUpUsername),
      email: serverEmailError ?? validateEmail(signUpEmail),
      password: validatePassword(signUpPassword),
      confirm: validateConfirmPassword(signUpPassword, confirmPassword),
    }),
    [name, signUpUsername, signUpEmail, signUpPassword, confirmPassword, serverEmailError]
  )

  const signInErrors = useMemo(
    () => ({
      email: validateEmail(signInEmail),
      password: signInPassword
        ? null
        : messages.login.validation.passwordRequired,
    }),
    [signInEmail, signInPassword]
  )

  const strength = getPasswordStrength(signUpPassword)
  const tone = strengthTone(Math.max(0, strength.score))

  const shouldShow = (field: keyof typeof signUpErrors, isTouched: boolean) =>
    Boolean(signUpErrors[field]) && (isTouched || attemptedSignUp)

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    setSignInError(null)

    if (signInErrors.email || signInErrors.password) {
      return
    }

    setIsSigningIn(true)

    const user = await safeAsync(() => signIn(signInEmail, signInPassword), {
      context: "AuthPage.signIn",
      onError: (e) => {
        const message = getErrorMessage(e)
        setSignInError(message)
        toast.error(message, { description: messages.login.toasts.signInFailed })
      },
    })

    setIsSigningIn(false)

    if (user) {
      // The provider derives the full state (identity, account status, AAL).
      const nextStatus = await refresh()

      if (nextStatus === "mfaChallenge") {
        navigate(ROUTES.mfaVerify, { replace: true })
        return
      }

      toast.success(messages.login.toasts.signedInAs(user.name))

      const state = location.state as { from?: string } | null
      navigate(state?.from ?? ROUTES.app, { replace: true })
    }
  }

  async function handleSignUp(event: FormEvent) {
    event.preventDefault()
    setAttemptedSignUp(true)
    setServerEmailError(null)

    const hasFieldErrors = Object.values(signUpErrors).some(Boolean)
    if (hasFieldErrors || !acceptedTerms) {
      return
    }

    setIsSigningUp(true)

    const result = await safeAsync(
      () => signUp(name, signUpUsername, signUpEmail, signUpPassword),
      {
        context: "AuthPage.signUp",
        onError: (e) => {
          const message = getErrorMessage(e)
          toast.error(message, {
            description: messages.login.toasts.signUpFailed,
          })
          if (
            e instanceof AppError &&
            e.code === errorCodes.emailAlreadyRegistered
          ) {
            setServerEmailError(message)
          }
        },
      }
    )

    setIsSigningUp(false)

    if (result) {
      if (result.needsEmailConfirmation) {
        setShowConfirmationNotice(true)
        toast.success(messages.login.toasts.confirmationSent)
        return
      }
      toast.success(
        messages.login.toasts.accountCreatedFor(result.user?.name ?? "")
      )
      await refresh()
      navigate(ROUTES.app, { replace: true })
    }
  }

  function switchTab(value: string) {
    navigate(value === "signup" ? ROUTES.register : ROUTES.login)
  }

  const isSignIn = activeTab === "signin"

  return (
    <div className="flex min-h-svh bg-background">
      <BrandPanel />

      <main className="flex flex-1">
        <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <icons.brand className="size-6" />
              </div>
              <p className="mt-3 font-heading text-xl font-bold">{APP.name}</p>
            </div>

            <BlurFade delay={0.2} inView>
            <div className="w-full rounded-3xl border border-border/80 bg-card p-8 shadow-lg">
              <div className="mb-6 text-center">
                <h1 className="font-heading text-2xl font-bold tracking-tight">
                  {isSignIn ? messages.login.title : messages.login.registerTitle}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {isSignIn
                    ? messages.login.subtitle
                    : messages.login.registerSubtitle}
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={switchTab} className="mb-6">
                <TabsList className="grid h-12 w-full grid-cols-2 gap-1 rounded-full bg-muted p-1">
                  <TabsTrigger
                    value="signin"
                    className="h-full rounded-full data-[slot=tabs-trigger]:data-[state=active]:bg-primary-soft data-[slot=tabs-trigger]:data-[state=active]:text-primary data-[slot=tabs-trigger]:data-[state=active]:shadow-none"
                  >
                    {messages.login.tabs.signIn}
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="h-full rounded-full data-[slot=tabs-trigger]:data-[state=active]:bg-primary-soft data-[slot=tabs-trigger]:data-[state=active]:text-primary data-[slot=tabs-trigger]:data-[state=active]:shadow-none"
                  >
                    {messages.login.tabs.signUp}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {isSignIn ? (
                <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                  <FormField
                    label={messages.login.emailLabel}
                    htmlFor="signin-email"
                    required
                    error={
                      signInErrors.email && signInEmailTouched
                        ? signInErrors.email
                        : undefined
                    }
                  >
                    <div className="relative">
                      <icons.mail className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        placeholder={messages.login.emailPlaceholder}
                        value={signInEmail}
                        onChange={(e) => {
                          setSignInEmail(e.target.value)
                          setSignInEmailTouched(true)
                        }}
                        required
                        aria-invalid={
                          Boolean(signInErrors.email) && signInEmailTouched
                            ? true
                            : undefined
                        }
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={messages.login.passwordLabel}
                    htmlFor="signin-password"
                    required
                    error={
                      signInErrors.password && signInPasswordTouched
                        ? signInErrors.password
                        : undefined
                    }
                  >
                    <PasswordField
                      id="signin-password"
                      value={signInPassword}
                      onChange={(value) => {
                        setSignInPassword(value)
                        setSignInPasswordTouched(true)
                      }}
                      placeholder={messages.login.passwordPlaceholder}
                      showPassword={showSignInPassword}
                      onToggle={() => setShowSignInPassword((show) => !show)}
                      invalid={Boolean(signInErrors.password) && signInPasswordTouched}
                    />
                  </FormField>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked === true)
                        }
                      />
                      <Label
                        htmlFor="remember-me"
                        className="font-normal text-muted-foreground"
                      >
                        {messages.login.rememberMe}
                      </Label>
                    </div>
                    <a
                      href={ROUTES.forgotPassword}
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(ROUTES.forgotPassword)
                      }}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {messages.login.forgotPassword}
                    </a>
                  </div>

                  {signInError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                      {signInError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    loading={isSigningIn}
                    className="h-12 w-full text-base"
                  >
                    {isSigningIn
                      ? messages.login.signingIn
                      : messages.login.signIn}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                  {showConfirmationNotice ? (
                    <div className="space-y-4 text-center" role="status">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft/70 text-primary dark:bg-primary/15">
                        <icons.mail className="size-6" />
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {messages.login.emailConfirmation.success}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => switchTab("signin")}
                      >
                        {messages.login.emailConfirmation.backToSignIn}
                      </Button>
                    </div>
                  ) : (
                  <>
                  <FormField
                    label={messages.login.nameLabel}
                    htmlFor="signup-name"
                    required
                    error={
                      shouldShow("name", Boolean(touched.name))
                        ? signUpErrors.name ?? undefined
                        : undefined
                    }
                  >
                    <div className="relative">
                      <icons.user className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        placeholder={messages.login.namePlaceholder}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          markTouched("name")
                        }}
                        required
                        aria-invalid={
                          shouldShow("name", Boolean(touched.name)) || undefined
                        }
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={messages.login.signUpUsernameLabel}
                    htmlFor="signup-username"
                    required
                    error={
                      shouldShow("username", Boolean(touched.username))
                        ? signUpErrors.username ?? undefined
                        : undefined
                    }
                  >
                    <div className="relative">
                      <icons.user className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        autoComplete="username"
                        placeholder={messages.login.signUpUsernamePlaceholder}
                        value={signUpUsername}
                        onChange={(e) => {
                          setSignUpUsername(e.target.value)
                          markTouched("username")
                        }}
                        required
                        aria-invalid={
                          shouldShow("username", Boolean(touched.username)) ||
                          undefined
                        }
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={messages.login.emailLabel}
                    htmlFor="signup-email"
                    required
                    error={
                      shouldShow("email", Boolean(touched.email))
                        ? signUpErrors.email ?? undefined
                        : undefined
                    }
                  >
                    <div className="relative">
                      <icons.mail className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder={messages.login.emailPlaceholder}
                        value={signUpEmail}
                        onChange={(e) => {
                          setSignUpEmail(e.target.value)
                          setServerEmailError(null)
                          markTouched("email")
                        }}
                        required
                        aria-invalid={
                          shouldShow("email", Boolean(touched.email)) || undefined
                        }
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={messages.login.passwordLabel}
                    htmlFor="signup-password"
                    required
                    hint={
                      signUpPassword && !signUpErrors.password
                        ? messages.login.validation.strengthHint
                        : undefined
                    }
                    error={
                      shouldShow("password", Boolean(touched.password))
                        ? signUpErrors.password ?? undefined
                        : undefined
                    }
                  >
                    <PasswordField
                      id="signup-password"
                      value={signUpPassword}
                      onChange={(value) => {
                        setSignUpPassword(value)
                        markTouched("password")
                      }}
                      placeholder={messages.login.passwordPlaceholder}
                      showPassword={showSignUpPassword}
                      onToggle={() => setShowSignUpPassword((show) => !show)}
                      invalid={
                        shouldShow("password", Boolean(touched.password)) ||
                        undefined
                      }
                    />
                    {signUpPassword.length > 0 && !signUpErrors.password && (
                      <div className="flex items-center gap-3 pt-0.5">
                        <Progress
                          value={(Math.max(0, strength.score) + 1) * 20}
                          variant={tone.variant}
                          className="h-1.5"
                          aria-label={strength.label}
                        />
                        <span
                          className={`text-xs font-medium whitespace-nowrap ${tone.label}`}
                        >
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </FormField>

                  <FormField
                    label={messages.login.confirmPasswordLabel}
                    htmlFor="signup-confirm-password"
                    required
                    error={
                      shouldShow("confirm", Boolean(touched.confirm))
                        ? signUpErrors.confirm ?? undefined
                        : undefined
                    }
                  >
                    <PasswordField
                      id="signup-confirm-password"
                      value={confirmPassword}
                      onChange={(value) => {
                        setConfirmPassword(value)
                        markTouched("confirm")
                      }}
                      placeholder={messages.login.confirmPasswordPlaceholder}
                      showPassword={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((show) => !show)}
                      invalid={
                        shouldShow("confirm", Boolean(touched.confirm)) ||
                        undefined
                      }
                    />
                  </FormField>

                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        id="terms"
                        className="mt-0.5"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) =>
                          setAcceptedTerms(checked === true)
                        }
                        aria-required="true"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm leading-relaxed font-normal text-muted-foreground"
                      >
                        {messages.login.termsLabel}{" "}
                        <a href="#" className="font-medium text-foreground underline underline-offset-4">
                          {messages.login.termsOfService}
                        </a>{" "}
                        {messages.login.and}{" "}
                        <a href="#" className="font-medium text-foreground underline underline-offset-4">
                          {messages.login.privacyPolicy}
                        </a>
                      </Label>
                    </div>
                    {attemptedSignUp && !acceptedTerms && (
                      <p className="text-xs text-destructive" role="alert">
                        {errorMessages.termsRequired}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    loading={isSigningUp}
                    className="h-12 w-full text-base"
                  >
                    {isSigningUp
                      ? messages.login.creatingAccount
                      : messages.login.createAccount}
                  </Button>
                  </>
                  )}
                </form>
              )}

            </div>
            </BlurFade>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignIn ? messages.login.noAccount : messages.login.haveAccount}{" "}
              <Button
                asChild
                variant="link"
                size="sm"
                className="h-auto p-0"
              >
                <a
                  href={isSignIn ? ROUTES.register : ROUTES.login}
                  onClick={(e) => {
                    e.preventDefault()
                    switchTab(isSignIn ? "signup" : "signin")
                  }}
                >
                  {isSignIn ? messages.login.createOne : messages.login.signInLink}
                </a>
              </Button>
            </p>

            <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Link
                to={ROUTES.landing}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <icons.arrowLeft className="size-4" />
                {messages.login.backToLanding}
              </Link>
              <span aria-hidden className="h-3.5 w-px bg-border" />
              <span>{messages.login.copyright(new Date().getFullYear())}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
