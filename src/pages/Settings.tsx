import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { FormField } from "@/components/form-field"
import { PageHeader } from "@/components/page-header"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROUTES, icons, messages } from "@/constants"
import { devices as deviceList, logs as logList } from "@/data/security"
import { services as serviceList, type ServiceEntry } from "@/data/services"
import {
  applyThemePreset,
  getStoredThemePreset,
  type ThemePreset,
} from "@/components/theme-toggle"
import { usePages } from "@/store/pages"
import { cn } from "@/lib/utils"

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

type MonitoringTab = "logs" | "services"

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

const radiusOptions = [
  { value: "0.5rem", label: messages.settings.appearance.radiusSm },
  { value: "0.625rem", label: messages.settings.appearance.radiusMd },
  { value: "0.75rem", label: messages.settings.appearance.radiusLg },
  { value: "1rem", label: messages.settings.appearance.radiusXl },
]

function getInitialTheme(): ThemePreset {
  return getStoredThemePreset()
}

function getInitialRadius(): string {
  if (typeof window === "undefined") return "0.75rem"
  return localStorage.getItem(RADIUS_KEY) ?? "0.75rem"
}

export function Settings() {
  const [active, setActive] = useState<SectionKey>("account")
  const [monitoringTab, setMonitoringTab] = useState<MonitoringTab>("logs")

  const [themePreset, setThemePreset] = useState<ThemePreset>(getInitialTheme)
  const [radius, setRadius] = useState<string>(getInitialRadius)

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

  const [logPage, setLogPage] = useState(1)
  const [logPageSize, setLogPageSize] = useState(10)

  const [serviceStates, setServiceStates] = useState<Record<string, ServiceEntry>>(
    () => Object.fromEntries(serviceList.map((s) => [s.id, { ...s }]))
  )
  const [restartingService, setRestartingService] = useState<string | null>(null)

  const [resetOpen, setResetOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const navigate = useNavigate()

  const [wsCreateOpen, setWsCreateOpen] = useState(false)
  const [wsCreateName, setWsCreateName] = useState("")
  const [wsCreateIcon, setWsCreateIcon] = useState("W")
  const [wsRenameTarget, setWsRenameTarget] = useState<{ id: string; name: string } | null>(null)
  const [wsRenameName, setWsRenameName] = useState("")
  const [wsDeleteTarget, setWsDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    applyThemePreset(themePreset)
  }, [themePreset])

  useEffect(() => {
    document.documentElement.style.setProperty("--radius", radius)
    localStorage.setItem(RADIUS_KEY, radius)
  }, [radius])

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

  const logPageCount = Math.max(1, Math.ceil(logList.length / logPageSize))
  const safeLogPage = Math.min(logPage, logPageCount)
  const visibleLogs = logList.slice(
    (safeLogPage - 1) * logPageSize,
    safeLogPage * logPageSize
  )

  useEffect(() => {
    if (logPage > logPageCount) {
      setLogPage(logPageCount)
    }
  }, [logPage, logPageCount])

  const handleRestartService = (serviceId: string) => {
    setRestartingService(serviceId)
    setTimeout(() => {
      setServiceStates((prev) => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          status: "operational",
          responseTime: Math.floor(Math.random() * 50) + 10,
          lastChecked: "Just now",
          lastRestart: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        },
      }))
      const name = serviceList.find((s) => s.id === serviceId)?.name ?? serviceId
      toast.success(messages.settings.services.restartSuccess(name))
      setRestartingService(null)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={messages.dashboard.eyebrow}
        title={messages.settings.title}
        description={messages.settings.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Card className="h-fit animate-fade-rise lg:sticky lg:top-6">
          <CardContent className="p-2">
            <nav
              className="flex gap-1 overflow-x-auto py-0.5 lg:flex-col lg:overflow-visible"
              aria-label={messages.settings.title}
            >
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActive(section.key)}
                    aria-current={active === section.key ? "page" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
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
        </Card>

        <div className="min-w-0 max-w-2xl space-y-6">
          {active === "account" && (
            <div className="space-y-6">
              <Card className="animate-fade-rise">
                <CardHeader>
                  <CardTitle>{messages.settings.account.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.account.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-5">
                    <Avatar className="size-16">
                      <AvatarFallback className="text-lg">{messages.layout.userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{messages.settings.account.avatar}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <icons.upload className="size-3.5" /> {messages.settings.account.avatarUpload}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          {messages.settings.account.avatarRemove}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label={messages.settings.account.name} htmlFor="account-name">
                      <Input
                        id="account-name"
                        defaultValue={messages.layout.userName}
                        placeholder={messages.settings.account.namePlaceholder}
                      />
                    </FormField>
                    <FormField label={messages.settings.account.email} htmlFor="account-email">
                      <Input
                        id="account-email"
                        type="email"
                        defaultValue={messages.layout.userEmail}
                        placeholder={messages.settings.account.emailPlaceholder}
                      />
                    </FormField>
                    <FormField label={messages.settings.account.phone} htmlFor="account-phone">
                      <Input
                        id="account-phone"
                        type="tel"
                        placeholder={messages.settings.account.phonePlaceholder}
                      />
                    </FormField>
                    <FormField label={messages.settings.account.role} htmlFor="account-role">
                      <Input
                        id="account-role"
                        placeholder={messages.settings.account.rolePlaceholder}
                      />
                    </FormField>
                    <FormField label={messages.settings.account.department} htmlFor="account-department">
                      <Input
                        id="account-department"
                        placeholder={messages.settings.account.departmentPlaceholder}
                      />
                    </FormField>
                    <FormField label={messages.settings.account.timezone} htmlFor="account-timezone">
                      <Select>
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
                    </FormField>
                  </div>

                  <FormField label={messages.settings.account.bio} htmlFor="account-bio">
                    <textarea
                      id="account-bio"
                      rows={3}
                      placeholder={messages.settings.account.bioPlaceholder}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormField>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    onClick={() => toast.success(messages.settings.account.saved)}
                  >
                    <icons.save /> {messages.settings.account.save}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="animate-fade-rise" style={{ animationDelay: "60ms" }}>
                <CardHeader>
                  <CardTitle>{messages.settings.account.password}</CardTitle>
                  <CardDescription>
                    {messages.settings.account.lastChanged}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setActive("security")}
                  >
                    <icons.lock className="size-3.5" /> {messages.settings.account.changePassword}
                  </Button>
                </CardContent>
              </Card>
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
                  <CardHeader>
                    <CardTitle>{messages.settings.workspace.members}</CardTitle>
                    <CardDescription>
                      {messages.settings.workspace.membersDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder={messages.settings.workspace.invitePlaceholder}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => toast.success(messages.settings.workspace.inviteSent)}
                      >
                        <icons.mail /> {messages.settings.workspace.invite}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-xl border border-border/70 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>{messages.layout.userInitials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{messages.layout.userName}</p>
                            <p className="text-xs text-muted-foreground">{messages.layout.userEmail}</p>
                          </div>
                        </div>
                        <Badge>{messages.settings.workspace.roleAdmin}</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border/70 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Jane Doe</p>
                            <p className="text-xs text-muted-foreground">jane@example.com</p>
                          </div>
                        </div>
                        <Badge variant="outline">{messages.settings.workspace.roleEditor}</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border/70 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>AS</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Alex Smith</p>
                            <p className="text-xs text-muted-foreground">alex@example.com</p>
                          </div>
                        </div>
                        <Badge variant="outline">{messages.settings.workspace.roleViewer}</Badge>
                      </div>
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

          {active === "appearance" && (
            <Card className="animate-fade-rise">
              <CardHeader>
                <CardTitle>{messages.settings.appearance.title}</CardTitle>
                <CardDescription>
                  {messages.settings.appearance.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  label={messages.settings.appearance.theme}
                  hint={messages.settings.appearance.themeHint}
                  htmlFor="appearance-theme"
                >
                  <Select value={themePreset} onValueChange={(v) => setThemePreset(v as ThemePreset)}>
                    <SelectTrigger id="appearance-theme" className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themePresets.map((preset) => (
                        <SelectItem key={preset.key} value={preset.key}>
                          <span className="flex items-center gap-2">
                            <span className="flex size-4 shrink-0 items-center justify-center gap-px overflow-hidden rounded border border-border/50">
                              {preset.previewColors.map((color, i) => (
                                <span key={i} className="h-full flex-1" style={{ backgroundColor: color }} />
                              ))}
                            </span>
                            {preset.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label={messages.settings.appearance.radius}
                  hint={messages.settings.appearance.radiusHint}
                  htmlFor="appearance-radius"
                >
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger
                      id="appearance-radius"
                      className="w-48"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {radiusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
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

          {active === "devices" && (
            <Card className="animate-fade-rise">
              <CardHeader>
                <CardTitle>{messages.settings.devices.title}</CardTitle>
                <CardDescription>{messages.settings.devices.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deviceList.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[18px] ${
                          device.isCurrent
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <icons.apple />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{device.name}</p>
                            {device.isCurrent && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                {messages.settings.devices.currentDevice}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>{device.browser}</span>
                            <span>{device.os}</span>
                            <span>{device.ipAddress}</span>
                          </div>
                          <div className="mt-1 flex gap-4 text-[11px] text-muted-foreground/70">
                            <span>{messages.settings.devices.lastSeen}: {device.lastSeen}</span>
                            <span>{messages.settings.devices.firstSeen}: {device.firstSeen}</span>
                          </div>
                        </div>
                      </div>
                      {!device.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() => toast.success(messages.settings.devices.removed)}
                        >
                          <icons.trash className="size-3.5" /> {messages.settings.devices.remove}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {active === "monitoring" && (() => {
            const allServices = Object.values(serviceStates)

            const statusDot = (status: ServiceEntry["status"]) =>
              status === "operational"
                ? "bg-emerald-500"
                : status === "degraded"
                  ? "bg-amber-500"
                  : "bg-red-500"

            return (
              <Card className="animate-fade-rise">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>{messages.settings.nav.monitoring}</CardTitle>
                    <CardDescription>{messages.settings.nav.monitoringDescription}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setMonitoringTab("logs")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        monitoringTab === "logs"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <icons.activity className="size-3.5" />
                      {messages.settings.nav.logs}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonitoringTab("services")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        monitoringTab === "services"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <icons.database className="size-3.5" />
                      {messages.settings.nav.services}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {monitoringTab === "logs" && (
                    <>
                      <div className="mb-4 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => {
                          const header = "Timestamp,Action,Category,Screen,Browser,Device,IP Address,Request,Details\n"
                          const csv = logList.map((l) =>
                            `${l.timestamp},"${l.action}",${l.category},${l.screen},${l.browser},${l.device},${l.ipAddress},"${l.request}","${l.details}"`
                          ).join("\n")
                          const blob = new Blob([header + csv], { type: "text/csv" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`
                          a.click()
                          URL.revokeObjectURL(url)
                          toast.success(messages.settings.logs.exported)
                        }}>
                          <icons.download className="size-4" /> {messages.settings.logs.export}
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead scope="col">{messages.settings.logs.timestamp}</TableHead>
                              <TableHead scope="col">{messages.settings.logs.action}</TableHead>
                              <TableHead scope="col">{messages.settings.logs.screen}</TableHead>
                              <TableHead scope="col">{messages.settings.logs.browser}</TableHead>
                              <TableHead scope="col">{messages.settings.logs.device}</TableHead>
                              <TableHead scope="col">{messages.settings.logs.ipAddress}</TableHead>
                              <TableHead scope="col">{messages.settings.logs.request}</TableHead>
                              <TableHead scope="col">{messages.settings.logs.details}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {visibleLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap text-xs tabular-nums">{log.timestamp}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    log.category === "login" ? "success" :
                                    log.category === "security" ? "destructive" :
                                    log.category === "settings" ? "info" :
                                    log.category === "timesheet" ? "warning" :
                                    "default"
                                  }>
                                    {log.action}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{log.screen}</TableCell>
                                <TableCell className="text-xs">{log.browser}</TableCell>
                                <TableCell className="text-xs">{log.device}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs tabular-nums">{log.ipAddress}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs font-mono text-muted-foreground">{log.request}</TableCell>
                                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{log.details}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/5 pt-4">
                        <p className="text-xs text-muted-foreground">
                          {messages.settings.logs.showingRecords(
                            (safeLogPage - 1) * logPageSize + 1,
                            Math.min(safeLogPage * logPageSize, logList.length),
                            logList.length
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {messages.settings.logs.pageSize}
                            </span>
                            <Select
                              value={String(logPageSize)}
                              onValueChange={(value) => {
                                setLogPageSize(Number(value))
                                setLogPage(1)
                              }}
                            >
                              <SelectTrigger
                                size="sm"
                                className="h-8 w-16"
                                aria-label={messages.settings.logs.pageSize}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="pr-1 text-xs text-muted-foreground">
                              {messages.settings.logs.pageOf(safeLogPage, logPageCount)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={safeLogPage <= 1}
                              aria-label={messages.settings.logs.previousPage}
                              onClick={() =>
                                setLogPage((p) => Math.max(1, p - 1))
                              }
                            >
                              <icons.chevronLeft />
                              {messages.settings.logs.previousPage}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={safeLogPage >= logPageCount}
                              aria-label={messages.settings.logs.nextPage}
                              onClick={() =>
                                setLogPage((p) => Math.min(logPageCount, p))
                              }
                            >
                              {messages.settings.logs.nextPage}
                              <icons.chevronRight />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {monitoringTab === "services" && (
                    <div className="space-y-3">
                      {allServices.map((service) => (
                        <div
                          key={service.id}
                          className="rounded-xl border border-border/70 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className={`mt-0.5 size-2.5 shrink-0 rounded-full ${statusDot(service.status)}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{service.name}</p>
                                  <Badge variant={service.status === "operational" ? "success" : service.status === "degraded" ? "warning" : "destructive"}>
                                    {service.status === "operational"
                                      ? messages.settings.services.operational
                                      : service.status === "degraded"
                                        ? messages.settings.services.degraded
                                        : service.status === "down"
                                          ? messages.settings.services.down
                                          : messages.settings.services.stopped}
                                  </Badge>
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">{service.description}</p>
                                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
                                  <span>{messages.settings.services.uptime}: <span className={`font-semibold ${service.uptime >= 99.9 ? "text-emerald-600 dark:text-emerald-400" : service.uptime >= 97 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{service.uptime}%</span></span>
                                  <span>{messages.settings.services.responseTime}: <span className="font-medium tabular-nums">{service.responseTime > 0 ? `${service.responseTime} ms` : "\u2014"}</span></span>
                                  <span>{messages.settings.services.version}: <span className="font-medium">{service.version}</span></span>
                                  <span>{messages.settings.services.port}: <span className="font-mono font-medium">{service.port}</span></span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground/70">
                                  <span>{messages.settings.services.lastChecked}: {service.lastChecked}</span>
                                  <span>{messages.settings.services.upSince}: {service.upSince}</span>
                                  {service.lastRestart && (
                                    <span>{messages.settings.services.lastRestart}: {service.lastRestart}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={restartingService === service.id || service.status === "stopped"}
                                onClick={() => handleRestartService(service.id)}
                              >
                                {restartingService === service.id ? (
                                  <>
                                    <icons.spinner className="size-3.5 animate-spin" />
                                    {messages.settings.services.restarting}
                                  </>
                                ) : (
                                  <>
                                    <icons.retry className="size-3.5" />
                                    {messages.settings.services.restart}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()}

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
        onConfirm={() => {
          setSignOutOpen(false)
          navigate(ROUTES.login)
        }}
      />
    </div>
  )
}
