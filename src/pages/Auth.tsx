import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { APP, ROUTES, icons, messages } from "@/constants"
import { errorMessages } from "@/constants/messages/errors"
import { getErrorMessage, safeAsync } from "@/lib/async"
import { signIn, signUp } from "@/services/auth"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 5.2c1.9 0 3.6.7 4.9 1.8l3.7-3.7C18.5 1.2 15.5 0 12 0 7.3 0 3.2 2.7 1.3 6.6l4.3 3.3C6.5 7.3 9 5.2 12 5.2z" />
      <path d="M23.5 12.3c0-1-.1-1.9-.3-2.8H12v5.3h6.5c-.3 1.5-1.2 2.7-2.5 3.6v3h4c2.4-2.2 3.5-5.5 3.5-9.1z" />
      <path d="M5.6 14.1c-.3-.8-.4-1.7-.4-2.6s.2-1.8.5-2.6l-4.3-3.3C.4 7.4 0 9.6 0 12s.4 4.6 1.3 6.6l4.3-3.3z" />
      <path d="M12 24c3.5 0 6.5-1.2 8.5-3.2l-4-3.1c-1.1.8-2.6 1.2-4.5 1.2-3 0-5.5-2-6.4-4.9l-4.3 3.3C3.2 21.3 7.3 24 12 24z" />
    </svg>
  )
}

function SocialButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button asChild variant="outline" className="h-14 text-base">
        <a href="#" rel="noreferrer">
          <GoogleIcon className="size-5" />
          {messages.login.continueWithGoogle}
        </a>
      </Button>
      <Button asChild variant="outline" className="h-14 text-base">
        <a href="#" rel="noreferrer">
          <icons.apple className="size-5" />
          {messages.login.continueWithApple}
        </a>
      </Button>
    </div>
  )
}

function Divider() {
  return (
    <div className="relative">
      <Separator />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
        {messages.login.continueWith}
      </span>
    </div>
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
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-foreground text-background">
            <icons.brand className="size-6" />
          </div>
          <span className="mt-3 text-xl font-semibold">{APP.name}</span>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-2xl">
              {isSignIn ? messages.login.title : messages.login.tabs.signUp}
            </CardTitle>
            <CardDescription className="text-base">
              {isSignIn
                ? messages.login.subtitle
                : messages.login.registerSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Tabs value={activeTab} onValueChange={switchTab} className="w-full">
              <TabsList className="h-14 w-full">
                <TabsTrigger value="signin" className="w-full text-lg">
                  {messages.login.tabs.signIn}
                </TabsTrigger>
                <TabsTrigger value="signup" className="w-full text-lg">
                  {messages.login.tabs.signUp}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isSignIn ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-username" className="text-base">
                    {messages.login.usernameLabel}
                  </Label>
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password" className="text-base">
                      {messages.login.passwordLabel}
                    </Label>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-sm">
                      <a href="#">{messages.login.forgotPassword}</a>
                    </Button>
                  </div>
                  <PasswordField
                    id="signin-password"
                    value={signInPassword}
                    onChange={setSignInPassword}
                    placeholder={messages.login.passwordPlaceholder}
                    showPassword={showSignInPassword}
                    onToggle={() => setShowSignInPassword((show) => !show)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    className="size-5"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-base font-normal text-muted-foreground"
                  >
                    {messages.login.rememberMe}
                  </Label>
                </div>

                {signInError && (
                  <p
                    role="alert"
                    className="rounded-md bg-destructive/10 px-3 py-2 text-base text-destructive"
                  >
                    {signInError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full text-lg"
                  disabled={isSigningIn}
                >
                  {isSigningIn
                    ? messages.login.signingIn
                    : messages.login.signIn}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-base">
                    {messages.login.nameLabel}
                  </Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-base">
                    {messages.login.signUpUsernameLabel}
                  </Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-base">
                    {messages.login.emailLabel}
                  </Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-base">
                    {messages.login.passwordLabel}
                  </Label>
                  <PasswordField
                    id="signup-password"
                    value={signUpPassword}
                    onChange={setSignUpPassword}
                    placeholder={messages.login.passwordPlaceholder}
                    showPassword={showSignUpPassword}
                    onToggle={() => setShowSignUpPassword((show) => !show)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-base">
                    {messages.login.confirmPasswordLabel}
                  </Label>
                  <PasswordField
                    id="signup-confirm-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder={messages.login.confirmPasswordPlaceholder}
                    showPassword={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((show) => !show)}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    className="mt-0.5 size-5"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) =>
                      setAcceptedTerms(checked === true)
                    }
                    aria-required="true"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-base leading-relaxed font-normal text-muted-foreground"
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
                    className="rounded-md bg-destructive/10 px-3 py-2 text-base text-destructive"
                  >
                    {signUpError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full text-lg"
                  disabled={isSigningUp}
                >
                  {isSigningUp
                    ? messages.login.creatingAccount
                    : messages.login.createAccount}
                </Button>
              </form>
            )}

            <Divider />
            <SocialButtons />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-base text-muted-foreground">
          {isSignIn ? messages.login.noAccount : messages.login.haveAccount}{" "}
          <Button
            asChild
            variant="link"
            size="sm"
            className="h-auto p-0 text-base"
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

        <Button asChild variant="ghost" className="mx-auto mt-6 flex">
          <Link to={ROUTES.landing}>
            <icons.arrowLeft />
            {messages.login.backToLanding}
          </Link>
        </Button>
      </div>
    </div>
  )
}
