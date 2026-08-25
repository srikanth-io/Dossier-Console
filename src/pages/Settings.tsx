import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FormField } from "@/components/common/form-field"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadiusScrubber } from "@/components/ui/elastic-slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  commonMessages,
  ROUTES,
  icons,
  messages,
} from "@/constants"
import { errorCodes } from "@/constants/messages/errors"
import {
  applyThemePreset,
  getStoredThemePreset,
  accentChoices,
  applyAccent,
  getStoredAccent,
  applyFontScale,
  getStoredFontScale,
  applyReducedMotion,
  getStoredReducedMotion,
  type ThemePreset,
  type FontScale,
} from "@/components/common/theme-toggle"
import { usePages } from "@/store/pages"
import { useAuth } from "@/store/auth"
import { ProfilePhotoDialog } from "@/components/settings/profile-photo-dialog"
import { DevicesPanel } from "@/components/settings/devices-panel"
import { ServicesPanel } from "@/components/settings/services-panel"
import { InviteDialog } from "@/components/settings/invite-dialog"
import { safeAsync } from "@/lib/async"
import { AppError } from "@/lib/errors"
import { getSupabase } from "@/lib/supabase"
import {
  getStoredAvatar,
} from "@/lib/avatar"
import {
  EMPTY_ACCOUNT_PROFILE,
  loadAccountProfile,
  saveAccountProfile,
  type AccountProfile,
} from "@/lib/account-profile"
import {
  countryCodes,
} from "@/data/country-codes"
import { cn } from "@/lib/utils"

type SecurityEventRow = {
  id: string
  event_type: string
  success: boolean
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

const RADIUS_KEY = "dossier-radius"

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
]

type SectionKey =
  | "account"
  | "appearance"
  | "workspace"
  | "notifications"
  | "security"
  | "devices"
  | "monitoring"
  | "billing"
  | "dangerZone"

const sections: { key: SectionKey; label: string; icon: (typeof icons)[keyof typeof icons] }[] = [
  { key: "account", label: messages.settings.nav.account, icon: icons.user },
  { key: "appearance", label: messages.settings.nav.appearance, icon: icons.sun },
  { key: "workspace", label: messages.settings.workspace.title, icon: icons.dossiers },
  { key: "notifications", label: messages.settings.nav.notifications, icon: icons.notifications },
  { key: "security", label: messages.settings.nav.security, icon: icons.lock },
  { key: "devices", label: messages.settings.nav.devices, icon: icons.apple },
  { key: "monitoring", label: messages.settings.nav.monitoring, icon: icons.activity },
  { key: "billing", label: messages.settings.nav.billing, icon: icons.reports },
  { key: "dangerZone", label: messages.settings.nav.dangerZone, icon: icons.alertCircle },
]

const themePresets: {
  key: ThemePreset
  label: string
  hint: string
  previewColors: string[]
}[] = [
  { key: "monochrome", label: messages.settings.appearance.monochrome, hint: messages.settings.appearance.monochromeHint, previewColors: ["#09090b", "#27272a", "#a1a1aa", "#fafafa"] },
  { key: "dracula", label: messages.settings.appearance.dracula, hint: messages.settings.appearance.draculaHint, previewColors: ["#282a36", "#44475a", "#bd93f9", "#f8f8f2"] },
  { key: "catppuccin", label: messages.settings.appearance.catppuccin, hint: messages.settings.appearance.catppuccinHint, previewColors: ["#1e1e2e", "#313244", "#cba6f7", "#cdd6f4"] },
  { key: "vercel", label: messages.settings.appearance.vercel, hint: messages.settings.appearance.vercelHint, previewColors: ["#000000", "#171717", "#ededed", "#666666"] },
  { key: "github", label: messages.settings.appearance.github, hint: messages.settings.appearance.githubHint, previewColors: ["#0d1117", "#21262d", "#58a6ff", "#c9d1d9"] },
]


function getInitialTheme(): ThemePreset {
  return getStoredThemePreset()
}

function getInitialRadius(): number {
  if (typeof window === "undefined") return 0.75
  const stored = localStorage.getItem(RADIUS_KEY)
  return stored ? parseFloat(stored) : 0.75
}

type SocialKey = "website" | "linkedin" | "github" | "twitter"

const socialFields: {
  key: SocialKey
  label: string
  placeholder: string
}[] = [
  { key: "website", label: messages.settings.account.website, placeholder: messages.settings.account.websitePlaceholder },
  { key: "linkedin", label: messages.settings.account.linkedin, placeholder: messages.settings.account.linkedinPlaceholder },
  { key: "github", label: messages.settings.account.github, placeholder: messages.settings.account.githubPlaceholder },
  { key: "twitter", label: messages.settings.account.twitter, placeholder: messages.settings.account.twitterPlaceholder },
]

/** Small favicon + domain preview for a saved social link. */
function LinkPreview({ url, label }: { url: string; label: string }) {
  let host = url
  try {
    host = new URL(url).hostname.replace(/^www\./, "")
  } catch {
    // Not a full URL yet — fall back to the raw text.
  }
  const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={messages.settings.account.visitLink}
      aria-label={messages.settings.account.visitLink}
      className="flex w-fit max-w-full items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      <img
        src={favicon}
        alt=""
        width={16}
        height={16}
        loading="lazy"
        className="size-4 rounded-sm"
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden"
        }}
      />
      <span className="shrink-0 font-medium">{label}</span>
      <span className="truncate">{host}</span>
      <icons.arrowRight className="size-3 shrink-0 -rotate-45" />
    </a>
  )
}

export function Settings() {
  const location = useLocation()
  const [active, setActive] = useState<SectionKey>(
    () => (location.state as { section?: SectionKey } | null)?.section ?? "account"
  )
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false)
  const activeSection = sections.find((s) => s.key === active)

  const [themePreset, setThemePreset] = useState<ThemePreset>(getInitialTheme)
  const [radius, setRadius] = useState<number>(getInitialRadius)
  const [accent, setAccent] = useState<string | null>(getStoredAccent)
  const [fontScale, setFontScale] = useState<FontScale>(getStoredFontScale)
  const [reducedMotion, setReducedMotion] = useState<boolean>(getStoredReducedMotion)

  const [reviewRequired, setReviewRequired] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)
  const [productUpdates, setProductUpdates] = useState(true)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [mfaTotp, setMfaTotp] = useState(false)
  const [mfaPasskey, setMfaPasskey] = useState(false)
  const [mfaEmailOtp, setMfaEmailOtp] = useState(false)

  const [securityEvents, setSecurityEvents] = useState<SecurityEventRow[]>([])

  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return null
    }
  }, [])

  const [resetOpen, setResetOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const navigate = useNavigate()
  const { signOut, status, user } = useAuth()
  const authenticated = status === "authenticated"

  const accountInitials = useMemo(() => {
    const source = (user?.name || user?.email || "?").trim()
    return source.slice(0, 2).toUpperCase()
  }, [user])

  const [avatar, setAvatar] = useState<string | null>(() => getStoredAvatar(null))
  const [photoOpen, setPhotoOpen] = useState(false)
  const [accountEditing, setAccountEditing] = useState(false)

  const [accountForm, setAccountForm] = useState<AccountProfile>(() => ({
    ...EMPTY_ACCOUNT_PROFILE,
    timezone: "",
  }))

  useEffect(() => {
    setAvatar(getStoredAvatar(user?.id))
    const stored = loadAccountProfile(user?.id)
    setAccountForm((current) => ({
      ...stored,
      name: stored.name || user?.name || "",
      timezone:
        stored.timezone ||
        (detectedTimezone && timezones.includes(detectedTimezone)
          ? detectedTimezone
          : current.timezone),
    }))
    setActiveSocial(
      new Set(socialFields.filter((f) => stored[f.key]).map((f) => f.key))
    )
  }, [user?.id, detectedTimezone])

  const updateAccountField =
    (field: keyof AccountProfile) =>
    (value: string) =>
      setAccountForm((form) => ({ ...form, [field]: value }))

  const [activeSocial, setActiveSocial] = useState<Set<SocialKey>>(new Set())

  const addSocialField = (key: SocialKey) => {
    setActiveSocial((set) => new Set(set).add(key))
  }

  const removeSocialField = (key: SocialKey) => {
    setActiveSocial((set) => {
      const next = new Set(set)
      next.delete(key)
      return next
    })
    updateAccountField(key)("")
  }

  const handleSaveAccount = () => {
    saveAccountProfile(accountForm, user?.id)
    toast.success(messages.settings.account.saved)
  }

  // Activity logs are the signed-in user's real audit trail (RLS-scoped).
  useEffect(() => {
    if (!authenticated) {
      setSecurityEvents([])
      return
    }

    let cancelled = false
    void safeAsync(async () => {
      const { data, error } = await getSupabase()
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)
      if (error) throw new AppError(errorCodes.dataLoadFailed, error.message)
      if (!cancelled) {
        setSecurityEvents((data ?? []) as SecurityEventRow[])
      }
    }, { context: "Settings.loadSecurityEvents" })

    return () => {
      cancelled = true
    }
  }, [authenticated])

  const [wsCreateOpen, setWsCreateOpen] = useState(false)
  const [wsCreateName, setWsCreateName] = useState("")
  const [wsCreateIcon, setWsCreateIcon] = useState("W")
  const [wsRenameTarget, setWsRenameTarget] = useState<{ id: string; name: string } | null>(null)
  const [wsRenameName, setWsRenameName] = useState("")
  const [wsDeleteTarget, setWsDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => {
    applyThemePreset(themePreset)
  }, [themePreset])

  useEffect(() => {
    const radiusRem = `${radius}rem`
    document.documentElement.style.setProperty("--radius", radiusRem)
    localStorage.setItem(RADIUS_KEY, radiusRem)
  }, [radius])

  const fontScaleOptions: { value: FontScale; label: string }[] = [
    { value: "compact", label: messages.settings.appearance.fontCompact },
    { value: "default", label: messages.settings.appearance.fontDefault },
    { value: "large", label: messages.settings.appearance.fontLarge },
  ]

  const handleUpdatePassword = (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordError(messages.errors.passwordMismatch)
      return
    }
    setPasswordError(null)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    toast.success(messages.settings.security.passwordUpdated)
  }

  const sectionsNav = (
    <CardContent className="p-2">
      <nav
        className="flex flex-col gap-1"
        aria-label={messages.settings.title}
      >
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => {
                setActive(section.key)
                if (!window.matchMedia("(min-width: 768px)").matches) {
                  setSectionMenuOpen(false)
                }
              }}
              aria-current={active === section.key ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors",
                active === section.key
                  ? "bg-primary-soft text-primary dark:bg-primary/15"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {section.label}
            </button>
          )
        })}
      </nav>
    </CardContent>
  )

  return (
    <div className="mx-auto w-full space-y-6">
      <PageHeader
        title={messages.settings.title}
        description={messages.settings.subtitle}
      />

      <div className="sticky top-14 z-20 flex items-center gap-2 bg-background/95 backdrop-blur py-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          aria-label={messages.settings.nav.menuLabel}
          aria-expanded={sectionMenuOpen}
          onClick={() => setSectionMenuOpen((open) => !open)}
        >
          <icons.menu className="size-4" />
          {activeSection?.label}
          <icons.chevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              sectionMenuOpen && "rotate-180"
            )}
          />
        </Button>
      </div>

      <div className="relative">
        {sectionMenuOpen && (
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setSectionMenuOpen(false)}
              className="fixed inset-0 z-30 cursor-default bg-background/60 backdrop-blur-[2px] md:hidden"
            />
            <Card
              id="settings-sections"
              className="fixed left-4 right-4 top-[4.5rem] z-40 max-h-[60vh] overflow-y-auto shadow-xl shadow-black/5 animate-fade-rise md:hidden"
            >
              {sectionsNav}
            </Card>
          </>
        )}

        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
          <Card className="hidden h-fit animate-fade-rise md:sticky md:top-6 md:block">
            {sectionsNav}
          </Card>

          <div className="min-w-0 space-y-6">
          {active === "account" && (
            <div className="space-y-6">
              <Card className="animate-fade-rise">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>{messages.settings.account.title}</CardTitle>
                    <CardDescription>
                      {messages.settings.account.description}
                    </CardDescription>
                  </div>
                  {!accountEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAccountEditing(true)}
                    >
                      <icons.pencil className="size-3.5" /> Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setPhotoOpen(true)}
                      aria-label={messages.settings.account.avatar}
                      className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Avatar className="size-28 ring-2 ring-border/60 transition-opacity group-hover:opacity-90">
                        {avatar && (
                          <AvatarImage src={avatar} alt={messages.settings.account.avatar} />
                        )}
                        <AvatarFallback className="text-3xl">
                          {accountInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 opacity-0 transition group-hover:opacity-100">
                        <icons.pencil className="size-6 text-primary" />
                      </span>
                      <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow-sm">
                        <icons.camera className="size-3.5" />
                      </span>
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label={messages.settings.account.name} htmlFor="account-name">
                      {accountEditing ? (
                        <Input
                          id="account-name"
                          value={accountForm.name}
                          onChange={(e) => updateAccountField("name")(e.target.value)}
                          placeholder={messages.settings.account.namePlaceholder}
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 rounded-lg border border-border/60 bg-muted/30 min-h-[36px] flex items-center">
                          {accountForm.name || <span className="text-muted-foreground italic">Not set</span>}
                        </p>
                      )}
                    </FormField>
                    <FormField label={messages.settings.account.email} htmlFor="account-email">
                      {accountEditing ? (
                        <Input
                          id="account-email"
                          type="email"
                          defaultValue={user?.email ?? ""}
                          placeholder={messages.settings.account.emailPlaceholder}
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 rounded-lg border border-border/60 bg-muted/30 min-h-[36px] flex items-center">
                          {user?.email || <span className="text-muted-foreground italic">Not set</span>}
                        </p>
                      )}
                    </FormField>
                    <FormField label={messages.settings.account.phone} htmlFor="account-phone">
                      {accountEditing ? (
                        <div className="flex gap-2">
                          <Select
                            value={accountForm.phoneCode}
                            onValueChange={updateAccountField("phoneCode")}
                          >
                            <SelectTrigger
                              className="w-[110px] shrink-0"
                              aria-label={messages.settings.account.phoneCode}
                            >
                              <SelectValue>{accountForm.phoneCode}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {countryCodes.map((entry) => (
                                <SelectItem
                                  key={`${entry.code}-${entry.country}`}
                                  value={entry.code}
                                >
                                  {entry.code} {entry.country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            id="account-phone"
                            type="tel"
                            value={accountForm.phone}
                            onChange={(e) => updateAccountField("phone")(e.target.value)}
                            placeholder={messages.settings.account.phonePlaceholder}
                          />
                        </div>
                      ) : (
                        <p className="text-sm py-2 px-3 rounded-lg border border-border/60 bg-muted/30 min-h-[36px] flex items-center">
                          {accountForm.phone ? `${accountForm.phoneCode} ${accountForm.phone}` : <span className="text-muted-foreground italic">Not set</span>}
                        </p>
                      )}
                    </FormField>
                    <FormField label={messages.settings.account.role} htmlFor="account-role">
                      {accountEditing ? (
                        <Input
                          id="account-role"
                          value={accountForm.role}
                          onChange={(e) => updateAccountField("role")(e.target.value)}
                          placeholder={messages.settings.account.rolePlaceholder}
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 rounded-lg border border-border/60 bg-muted/30 min-h-[36px] flex items-center">
                          {accountForm.role || <span className="text-muted-foreground italic">Not set</span>}
                        </p>
                      )}
                    </FormField>
                    <FormField label={messages.settings.account.department} htmlFor="account-department">
                      {accountEditing ? (
                        <Input
                          id="account-department"
                          value={accountForm.department}
                          onChange={(e) => updateAccountField("department")(e.target.value)}
                          placeholder={messages.settings.account.departmentPlaceholder}
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 rounded-lg border border-border/60 bg-muted/30 min-h-[36px] flex items-center">
                          {accountForm.department || <span className="text-muted-foreground italic">Not set</span>}
                        </p>
                      )}
                    </FormField>
                    <FormField label={messages.settings.account.timezone} htmlFor="account-timezone">
                      {accountEditing ? (
                        <>
                          <Select
                            value={accountForm.timezone || undefined}
                            onValueChange={updateAccountField("timezone")}
                          >
                            <SelectTrigger id="account-timezone">
                              <SelectValue placeholder={messages.settings.account.timezonePlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {timezones.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                  {tz.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {detectedTimezone && (
                            <p className="text-xs text-muted-foreground">
                              {messages.settings.account.timezoneDetected(detectedTimezone)}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm py-2 px-3 rounded-lg border border-border/60 bg-muted/30 min-h-[36px] flex items-center">
                          {accountForm.timezone?.replace(/_/g, " ") || <span className="text-muted-foreground italic">Not set</span>}
                        </p>
                      )}
                    </FormField>
                  </div>

                  <FormField label={messages.settings.account.bio} htmlFor="account-bio">
                    {accountEditing ? (
                      <textarea
                        id="account-bio"
                        rows={3}
                        value={accountForm.bio}
                        onChange={(e) => updateAccountField("bio")(e.target.value)}
                        placeholder={messages.settings.account.bioPlaceholder}
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 rounded-lg border border-border/60 bg-muted/30 min-h-[60px] whitespace-pre-wrap">
                        {accountForm.bio || <span className="text-muted-foreground italic">Not set</span>}
                      </p>
                    )}
                  </FormField>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">{messages.settings.account.socialHeading}</p>
                    {accountEditing ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {socialFields.map((field) => {
                            const isActive = activeSocial.has(field.key)
                            return isActive ? (
                              <span
                                key={field.key}
                                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pr-1.5 pl-3 text-xs font-medium text-primary"
                              >
                                {field.label}
                                <button
                                  type="button"
                                  onClick={() => removeSocialField(field.key)}
                                  aria-label={messages.settings.account.removeSocial(field.label)}
                                  className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                                >
                                  <icons.close className="size-3" />
                                </button>
                              </span>
                            ) : (
                              <button
                                key={field.key}
                                type="button"
                                onClick={() => addSocialField(field.key)}
                                className="flex items-center gap-1 rounded-full border border-dashed border-border/70 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                              >
                                <icons.plus className="size-3" /> {field.label}
                              </button>
                            )
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {messages.settings.account.socialHint}
                        </p>
                        {activeSocial.size > 0 && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            {socialFields
                              .filter((field) => activeSocial.has(field.key))
                              .map((field) => (
                                <FormField key={field.key} label={field.label} htmlFor={`account-${field.key}`}>
                                  <Input
                                    id={`account-${field.key}`}
                                    type="url"
                                    value={accountForm[field.key]}
                                    onChange={(e) => updateAccountField(field.key)(e.target.value)}
                                    placeholder={field.placeholder}
                                  />
                                  {accountForm[field.key] && (
                                    <LinkPreview
                                      url={accountForm[field.key]}
                                      label={field.label}
                                    />
                                  )}
                                </FormField>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {socialFields
                          .filter((field) => activeSocial.has(field.key))
                          .map((field) => (
                            accountForm[field.key] ? (
                              <LinkPreview
                                key={field.key}
                                url={accountForm[field.key]}
                                label={field.label}
                              />
                            ) : null
                          ))}
                        {activeSocial.size === 0 && (
                          <p className="text-sm text-muted-foreground italic">No social links added</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                {accountEditing && (
                  <CardFooter className="justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAccountEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      handleSaveAccount()
                      setAccountEditing(false)
                    }}>
                      <icons.save /> {messages.settings.account.save}
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <Card className="animate-fade-rise" style={{ animationDelay: "60ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>{messages.settings.account.password}</CardTitle>
                    <CardDescription>
                      {messages.settings.account.lastChanged}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActive("security")}
                  >
                    <icons.lock className="size-3.5" /> {messages.settings.account.changePassword}
                  </Button>
                </CardHeader>
              </Card>

              <ProfilePhotoDialog
                open={photoOpen}
                onOpenChange={setPhotoOpen}
                userId={user?.id}
                initials={accountInitials}
                value={avatar}
                onChange={setAvatar}
              />
            </div>
          )}

          {active === "workspace" && (() => {
            const { workspaces, currentWorkspace, setCurrentWorkspace } = usePages()
            return (
              <div className="space-y-6">
                <Card className="animate-fade-rise">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>{messages.settings.workspace.title}</CardTitle>
                      <CardDescription>
                        {messages.settings.workspace.description}
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setWsCreateOpen(true)}>
                      <icons.plus /> {messages.settings.workspace.create}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workspaces.map((ws) => (
                      <div
                        key={ws.id}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
                          ws.id === currentWorkspace.id
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/70"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                              ws.id === currentWorkspace.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {ws.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{ws.name}</p>
                              {ws.id === currentWorkspace.id && (
                                <Badge variant="success">{messages.settings.workspace.current}</Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {ws.pageCount} {messages.settings.workspace.pages}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ws.id !== currentWorkspace.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentWorkspace(ws.id)
                                toast.success(`${messages.settings.workspace.switchSuccess}: ${ws.name}`)
                              }}
                            >
                              {messages.settings.workspace.switchButton}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setWsRenameTarget({ id: ws.id, name: ws.name })
                              setWsRenameName(ws.name)
                            }}
                          >
                            <icons.pencil className="size-3.5" />
                          </Button>
                          {workspaces.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setWsDeleteTarget({ id: ws.id, name: ws.name })}
                            >
                              <icons.trash className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="animate-fade-rise" style={{ animationDelay: "60ms" }}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>{messages.settings.workspace.members}</CardTitle>
                      <CardDescription>
                        {messages.settings.workspace.membersDescription}
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setInviteOpen(true)}>
                      <icons.inviteUser /> {messages.settings.workspace.invite}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-border/70 p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback>{accountInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user?.name || commonMessages.none}</p>
                          <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
                        </div>
                      </div>
                      <Badge>{messages.settings.workspace.accessEditable}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })()}

          {/* Workspace Create Dialog */}
          <Dialog open={wsCreateOpen} onOpenChange={setWsCreateOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{messages.settings.workspace.create}</DialogTitle>
                <DialogDescription>
                  {messages.settings.workspace.createDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <FormField label={messages.settings.workspace.workspaceName} htmlFor="ws-name">
                  <Input
                    id="ws-name"
                    value={wsCreateName}
                    onChange={(e) => setWsCreateName(e.target.value)}
                    placeholder={messages.settings.workspace.workspaceNamePlaceholder}
                  />
                </FormField>
                <FormField label={messages.settings.workspace.icon} htmlFor="ws-icon">
                  <Input
                    id="ws-icon"
                    value={wsCreateIcon}
                    onChange={(e) => setWsCreateIcon(e.target.value.slice(0, 2))}
                    maxLength={2}
                    className="w-20 text-center text-lg font-bold"
                  />
                </FormField>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{messages.common.cancel}</Button>
                </DialogClose>
                <Button
                  disabled={!wsCreateName.trim()}
                  onClick={() => {
                    toast.success(`${messages.settings.workspace.createSuccess}: ${wsCreateName}`)
                    setWsCreateName("")
                    setWsCreateIcon("W")
                    setWsCreateOpen(false)
                  }}
                >
                  <icons.plus /> {messages.settings.workspace.create}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Workspace Rename Dialog */}
          <Dialog open={!!wsRenameTarget} onOpenChange={(o) => { if (!o) setWsRenameTarget(null) }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{messages.settings.workspace.renameTitle}</DialogTitle>
                <DialogDescription>
                  {messages.settings.workspace.renameDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <FormField label={messages.settings.workspace.workspaceName} htmlFor="ws-rename">
                  <Input
                    id="ws-rename"
                    value={wsRenameName}
                    onChange={(e) => setWsRenameName(e.target.value)}
                    placeholder={messages.settings.workspace.workspaceNamePlaceholder}
                  />
                </FormField>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{messages.common.cancel}</Button>
                </DialogClose>
                <Button
                  disabled={!wsRenameName.trim() || wsRenameName === wsRenameTarget?.name}
                  onClick={() => {
                    toast.success(`${messages.settings.workspace.renameSuccess}: ${wsRenameName}`)
                    setWsRenameTarget(null)
                    setWsRenameName("")
                  }}
                >
                  <icons.save /> {messages.settings.workspace.renameSave}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Workspace Delete Dialog */}
          <Dialog open={!!wsDeleteTarget} onOpenChange={(o) => { if (!o) setWsDeleteTarget(null) }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{messages.settings.workspace.deleteConfirm}</DialogTitle>
                <DialogDescription>
                  {messages.settings.workspace.deleteConfirmDescription(wsDeleteTarget?.name ?? "")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{messages.common.cancel}</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    toast.success(`${messages.settings.workspace.deleteSuccess}: ${wsDeleteTarget?.name}`)
                    setWsDeleteTarget(null)
                  }}
                >
                  <icons.trash /> {messages.settings.workspace.deleteButton}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />

          {active === "appearance" && (
            <Card className="animate-fade-rise">
              <CardHeader>
                <CardTitle>{messages.settings.appearance.title}</CardTitle>
                <CardDescription>
                  {messages.settings.appearance.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Live preview */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {messages.settings.appearance.previewTitle}
                  </p>
                  <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">
                        {messages.settings.appearance.previewTitle}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                        {messages.settings.appearance.previewBadge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {messages.settings.appearance.previewDescription}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm">
                        <icons.sparkles /> {messages.settings.appearance.previewPrimary}
                      </Button>
                      <Button size="sm" variant="outline">
                        {messages.settings.appearance.previewSecondary}
                      </Button>
                      <Button size="sm" variant="ghost">
                        {commonMessages.cancel}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Theme preset swatches */}
                <FormField label={messages.settings.appearance.theme} hint={messages.settings.appearance.themeHint}>
                  <div
                    role="radiogroup"
                    aria-label={messages.settings.appearance.theme}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-5"
                  >
                    {themePresets.map((preset) => {
                      const activePreset = themePreset === preset.key
                      return (
                        <button
                          key={preset.key}
                          type="button"
                          role="radio"
                          aria-checked={activePreset}
                          title={preset.hint}
                          onClick={() => setThemePreset(preset.key)}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border text-left transition-colors",
                            activePreset
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border/70 hover:border-border"
                          )}
                        >
                          <span className="flex h-12">
                            {preset.previewColors.map((color, i) => (
                              <span key={i} className="h-full flex-1" style={{ backgroundColor: color }} />
                            ))}
                          </span>
                          <span className="flex items-center justify-between gap-1 px-2.5 py-2">
                            <span className="truncate text-xs font-medium">{preset.label}</span>
                            {activePreset && <icons.check className="size-3.5 shrink-0 text-primary" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </FormField>

                {/* Accent colour */}
                <FormField
                  label={messages.settings.appearance.accent}
                  hint={messages.settings.appearance.accentHint}
                >
                  <div
                    role="radiogroup"
                    aria-label={messages.settings.appearance.accent}
                    className="flex flex-wrap items-center gap-3"
                  >
                    {accentChoices.map((choice) => {
                      const activeAccent = accent === choice.key
                      return (
                        <button
                          key={choice.key}
                          type="button"
                          role="radio"
                          aria-checked={activeAccent}
                          title={
                            choice.key === "auto"
                              ? messages.settings.appearance.accentAuto
                              : choice.key.charAt(0).toUpperCase() + choice.key.slice(1)
                          }
                          onClick={() => {
                            setAccent(choice.key)
                            applyAccent(choice.key)
                          }}
                          className={cn(
                            "relative flex size-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105",
                            choice.value
                              ? "border-transparent"
                              : "border-dashed border-muted-foreground/50 bg-muted/40",
                            activeAccent && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                          )}
                          style={choice.value ? { backgroundColor: choice.value } : undefined}
                        >
                          {choice.value ? null : (
                            <icons.rotate className="size-4 text-muted-foreground" />
                          )}
                          {activeAccent && (
                            <icons.check
                              className="size-4"
                              style={{ color: choice.dark ?? undefined }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </FormField>

                {/* Interface size + corner radius */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label={messages.settings.appearance.fontScale} hint={messages.settings.appearance.fontScaleHint}>
                    <div
                      role="radiogroup"
                      aria-label={messages.settings.appearance.fontScale}
                      className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-1"
                    >
                      {fontScaleOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={fontScale === option.value}
                          onClick={() => {
                            setFontScale(option.value)
                            applyFontScale(option.value)
                          }}
                          className={cn(
                            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            fontScale === option.value
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label={messages.settings.appearance.radius} hint={messages.settings.appearance.radiusHint}>
                    <RadiusScrubber
                      value={radius}
                      onValueChange={setRadius}
                      min={0.25}
                      max={1.5}
                    />
                  </FormField>
                </div>

                {/* Motion */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{messages.settings.appearance.reduceMotion}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {messages.settings.appearance.motionHint}
                    </p>
                  </div>
                  <Switch
                    checked={reducedMotion}
                    onCheckedChange={(v) => {
                      setReducedMotion(v)
                      applyReducedMotion(v)
                    }}
                    aria-label={messages.settings.appearance.reduceMotion}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  onClick={() => toast.success(messages.settings.appearance.saved)}
                >
                  <icons.save /> {messages.settings.appearance.saved}
                </Button>
              </CardFooter>
            </Card>
          )}

          {active === "notifications" && (
            <Card className="animate-fade-rise">
              <CardHeader>
                <CardTitle>{messages.settings.notifications.title}</CardTitle>
                <CardDescription>
                  {messages.settings.notifications.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {messages.settings.notifications.reviewRequired}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {messages.settings.notifications.reviewRequiredHint}
                    </p>
                  </div>
                  <Switch
                    checked={reviewRequired}
                    onCheckedChange={setReviewRequired}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {messages.settings.notifications.notifications}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {messages.settings.notifications.notificationsHint}
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {messages.settings.notifications.emailDigest}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {messages.settings.notifications.emailDigestHint}
                    </p>
                  </div>
                  <Switch
                    checked={emailDigest}
                    onCheckedChange={setEmailDigest}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {messages.settings.notifications.productUpdates}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {messages.settings.notifications.productUpdatesHint}
                    </p>
                  </div>
                  <Switch
                    checked={productUpdates}
                    onCheckedChange={setProductUpdates}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  onClick={() => toast.success(messages.settings.notifications.saved)}
                >
                  <icons.save /> {messages.settings.notifications.save}
                </Button>
              </CardFooter>
            </Card>
          )}

          {active === "security" && (
            <div className="space-y-6">
              <Card className="animate-fade-rise">
                <CardHeader>
                  <CardTitle>{messages.settings.security.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.security.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <FormField
                      label={messages.settings.security.currentPassword}
                      htmlFor="current-password"
                    >
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={messages.settings.security.currentPasswordPlaceholder}
                      />
                    </FormField>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        label={messages.settings.security.newPassword}
                        htmlFor="new-password"
                      >
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={messages.settings.security.newPasswordPlaceholder}
                        />
                      </FormField>
                      <FormField
                        label={messages.settings.security.confirmPassword}
                        htmlFor="confirm-password"
                        error={passwordError ?? undefined}
                      >
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={messages.settings.security.confirmPasswordPlaceholder}
                        />
                      </FormField>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {messages.settings.security.passwordHint}
                    </p>
                    <Button type="submit">
                      <icons.shield /> {messages.settings.security.updatePassword}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="animate-fade-rise" style={{ animationDelay: "60ms" }}>
                <CardHeader>
                  <CardTitle>{messages.settings.security.mfa.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.security.mfa.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "totp" as const, icon: icons.shield, enabled: mfaTotp, setEnabled: setMfaTotp },
                    { key: "passkey" as const, icon: icons.lock, enabled: mfaPasskey, setEnabled: setMfaPasskey },
                    { key: "emailOtp" as const, icon: icons.mail, enabled: mfaEmailOtp, setEnabled: setMfaEmailOtp },
                  ].map(({ key, icon: MfaIcon, enabled, setEnabled }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[18px] ${
                          enabled
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <MfaIcon />
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {messages.settings.security.mfa[key].title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {messages.settings.security.mfa[key].description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(value) => {
                          setEnabled(value)
                          toast.success(
                            value
                              ? messages.settings.security.mfa[key].enabled
                              : messages.settings.security.mfa[key].disabled
                          )
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {active === "devices" && <DevicesPanel events={securityEvents} />}

          {active === "monitoring" && (
            <Card className="animate-fade-rise">
              <CardHeader>
                <CardTitle>{messages.settings.nav.monitoring}</CardTitle>
                <CardDescription>{messages.settings.nav.monitoringDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <ServicesPanel />
              </CardContent>
            </Card>
          )}


          {active === "billing" && (
            <Card className="animate-fade-rise">
              <CardHeader>
                <CardTitle>{messages.settings.billing.title}</CardTitle>
                <CardDescription>
                  {messages.settings.billing.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-primary/5 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm [&_svg]:size-5">
                      <icons.sparkles />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {messages.settings.billing.currentPlan}
                      </p>
                      <p className="font-heading text-lg font-extrabold">
                        {messages.settings.billing.planPro}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {messages.settings.billing.planProDescription}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">
                      {messages.settings.billing.manage}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() =>
                        toast.success(messages.settings.billing.upgraded)
                      }
                    >
                      {messages.settings.billing.upgrade}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "dangerZone" && (
            <Card className="animate-fade-rise border-destructive/30">
              <CardHeader>
                <CardTitle>{messages.settings.dangerZone.title}</CardTitle>
                <CardDescription>
                  {messages.settings.dangerZone.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {messages.settings.dangerZone.resetTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {messages.settings.dangerZone.resetDescription}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10"
                    onClick={() => setResetOpen(true)}
                  >
                    <icons.retry /> {messages.settings.dangerZone.resetButton}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      {messages.settings.dangerZone.deleteTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {messages.settings.dangerZone.deleteDescription}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <icons.trash /> {messages.settings.dangerZone.deleteButton}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {messages.settings.dangerZone.signOutTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {messages.settings.dangerZone.signOutDescription}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setSignOutOpen(true)}
                  >
                    <icons.signOut /> {messages.settings.dangerZone.signOutButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={messages.settings.dangerZone.resetConfirm}
        description={messages.settings.dangerZone.resetConfirmDescription}
        confirmLabel={messages.settings.dangerZone.resetButton}
        variant="danger"
        onConfirm={() => {
          setResetOpen(false)
          toast.success(messages.settings.dangerZone.resetSuccess)
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={messages.settings.dangerZone.deleteConfirm}
        description={messages.settings.dangerZone.deleteConfirmDescription}
        confirmLabel={messages.settings.dangerZone.deleteButton}
        variant="danger"
        onConfirm={() => {
          setDeleteOpen(false)
          toast.success(messages.settings.dangerZone.deleteSuccess)
        }}
      />
      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title={messages.settings.dangerZone.signOutConfirm}
        description={messages.settings.dangerZone.signOutConfirmDescription}
        confirmLabel={messages.settings.dangerZone.signOutButton}
        variant="danger"
        onConfirm={async () => {
          setSignOutOpen(false)
          await signOut()
          navigate(ROUTES.login, { replace: true })
        }}
      />
    </div>
  )
}
