import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { APP, ROUTES, icons, messages } from "@/constants"
import { errorMessages } from "@/constants/messages/errors"
import { getErrorMessage, safeAsync } from "@/lib/async"
import { signIn, signUp } from "@/services/auth"

function BrandPanel() {
  return (
    <aside className="relative hidden w-[44%] shrink-0 overflow-hidden bg-gradient-brand lg:flex">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 size-[480px] rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute -right-24 -bottom-32 size-[420px] rounded-full bg-white/10 blur-[110px]" />
      </div>

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
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  showPassword: boolean
  onToggle: () => void
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

export function Auth() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeTab = pathname === ROUTES.register ? "signup" : "signin"

  const [signInError, setSignInError] = useState<string | null>(null)
  const [signUpError, setSignUpError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signInUsername, setSignInUsername] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [name, setName] = useState("")
  const [signUpUsername, setSignUpUsername] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    setSignInError(null)
    setIsSigningIn(true)

    const user = await safeAsync(() => signIn(signInUsername, signInPassword), {
      context: "AuthPage.signIn",
      onError: (e) => setSignInError(getErrorMessage(e)),
    })

    setIsSigningIn(false)

    if (user) {
      navigate(ROUTES.app)
    }
  }

  async function handleSignUp(event: FormEvent) {
    event.preventDefault()
    setSignUpError(null)

    if (!acceptedTerms) {
      setSignUpError(errorMessages.termsRequired)
      return
    }

    if (signUpPassword !== confirmPassword) {
      setSignUpError(errorMessages.passwordMismatch)
      return
    }

    setIsSigningUp(true)

    const user = await safeAsync(
      () => signUp(name, signUpUsername, signUpEmail, signUpPassword),
      {
        context: "AuthPage.signUp",
        onError: (e) => setSignUpError(getErrorMessage(e)),
      }
    )

    setIsSigningUp(false)

    if (user) {
      navigate(ROUTES.app)
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
                <form onSubmit={handleSignIn} className="space-y-4">
                  <FormField
                    label={messages.login.usernameLabel}
                    htmlFor="signin-username"
                    required
                  >
                    <div className="relative">
                      <icons.user className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signin-username"
                        type="text"
                        autoComplete="username"
                        placeholder={messages.login.usernamePlaceholder}
                        value={signInUsername}
                        onChange={(e) => setSignInUsername(e.target.value)}
                        required
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={messages.login.passwordLabel}
                    htmlFor="signin-password"
                    required
                  >
                    <PasswordField
                      id="signin-password"
                      value={signInPassword}
                      onChange={setSignInPassword}
                      placeholder={messages.login.passwordPlaceholder}
                      showPassword={showSignInPassword}
                      onToggle={() => setShowSignInPassword((show) => !show)}
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
                <form onSubmit={handleSignUp} className="space-y-4">
                  <FormField
                    label={messages.login.nameLabel}
                    htmlFor="signup-name"
                    required
                  >
                    <div className="relative">
                      <icons.user className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        placeholder={messages.login.namePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={messages.login.signUpUsernameLabel}
                    htmlFor="signup-username"
                    required
                  >
                    <div className="relative">
                      <icons.user className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        autoComplete="username"
                        placeholder={messages.login.signUpUsernamePlaceholder}
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value)}
                        required
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={messages.login.emailLabel}
                    htmlFor="signup-email"
                    required
                  >
                    <div className="relative">
                      <icons.mail className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder={messages.login.emailPlaceholder}
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={messages.login.passwordLabel}
                    htmlFor="signup-password"
                    required
                  >
                    <PasswordField
                      id="signup-password"
                      value={signUpPassword}
                      onChange={setSignUpPassword}
                      placeholder={messages.login.passwordPlaceholder}
                      showPassword={showSignUpPassword}
                      onToggle={() => setShowSignUpPassword((show) => !show)}
                    />
                  </FormField>

                  <FormField
                    label={messages.login.confirmPasswordLabel}
                    htmlFor="signup-confirm-password"
                    required
                  >
                    <PasswordField
                      id="signup-confirm-password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder={messages.login.confirmPasswordPlaceholder}
                      showPassword={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((show) => !show)}
                    />
                  </FormField>

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

                  {signUpError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                      {signUpError}
                    </p>
                  )}

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
                </form>
              )}

            </div>

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
