import { useEffect, useState, type FormEvent } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { APP, departmentLabels, icons, messages } from "@/constants"
import { devices as deviceList, logs as logList } from "@/data/security"
import { services as serviceList, type ServiceEntry } from "@/data/services"
import { cn } from "@/lib/utils"

const THEME_KEY = "dossier-theme"
const RADIUS_KEY = "dossier-radius"

type SectionKey =
  | "account"
  | "appearance"
  | "notifications"
  | "security"
  | "devices"
  | "logs"
  | "services"
  | "billing"
  | "dangerZone"

type ThemePreference = "light" | "dark" | "system"

const sections: { key: SectionKey; label: string; icon: (typeof icons)[keyof typeof icons] }[] = [
  { key: "account", label: messages.settings.nav.account, icon: icons.user },
  { key: "appearance", label: messages.settings.nav.appearance, icon: icons.sun },
  { key: "notifications", label: messages.settings.nav.notifications, icon: icons.notifications },
  { key: "security", label: messages.settings.nav.security, icon: icons.lock },
  { key: "devices", label: messages.settings.nav.devices, icon: icons.apple },
  { key: "logs", label: messages.settings.nav.logs, icon: icons.activity },
  { key: "services", label: messages.settings.nav.services, icon: icons.activity },
  { key: "billing", label: messages.settings.nav.billing, icon: icons.reports },
  { key: "dangerZone", label: messages.settings.nav.dangerZone, icon: icons.alertCircle },
]

const themeOptions: {
  key: ThemePreference
  label: string
  previewClass: string
}[] = [
  { key: "light", label: messages.settings.appearance.light, previewClass: "bg-white border-slate-200" },
  { key: "dark", label: messages.settings.appearance.dark, previewClass: "bg-slate-950 border-slate-700" },
  { key: "system", label: messages.settings.appearance.system, previewClass: "bg-gradient-to-r from-white to-slate-950 border-slate-300" },
]

const radiusOptions = [
  { value: "0.5rem", label: messages.settings.appearance.radiusSm },
  { value: "0.625rem", label: messages.settings.appearance.radiusMd },
  { value: "0.75rem", label: messages.settings.appearance.radiusLg },
  { value: "1rem", label: messages.settings.appearance.radiusXl },
]

function getInitialTheme(): ThemePreference {
  if (typeof window === "undefined") return "system"
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === "light" || stored === "dark" || stored === "system") return stored
  return "system"
}

function getInitialRadius(): string {
  if (typeof window === "undefined") return "0.75rem"
  return localStorage.getItem(RADIUS_KEY) ?? "0.75rem"
}

export function Settings() {
  const [active, setActive] = useState<SectionKey>("account")

  const [theme, setTheme] = useState<ThemePreference>(getInitialTheme)
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

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = () => {
      const resolved =
        theme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme
      root.classList.toggle("dark", resolved === "dark")
      root.style.colorScheme = resolved
    }
    applyTheme()
    localStorage.setItem(THEME_KEY, theme)
    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      media.addEventListener("change", applyTheme)
      return () => media.removeEventListener("change", applyTheme)
    }
  }, [theme])

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
            <Card className="animate-fade-rise">
              <CardHeader>
                <CardTitle>{messages.settings.account.title}</CardTitle>
                <CardDescription>
                  {messages.settings.account.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={messages.settings.account.name} htmlFor="account-name">
                    <Input
                      id="account-name"
                      placeholder={messages.settings.account.namePlaceholder}
                    />
                  </FormField>
                  <FormField label={messages.settings.account.email} htmlFor="account-email">
                    <Input
                      id="account-email"
                      type="email"
                      placeholder={messages.settings.account.emailPlaceholder}
                    />
                  </FormField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label={messages.settings.workspace.workspaceName}
                    htmlFor="workspace-name"
                  >
                    <Input
                      id="workspace-name"
                      defaultValue={APP.defaultWorkspaceName}
                    />
                  </FormField>
                  <FormField
                    label={messages.settings.workspace.defaultDepartment}
                    htmlFor="default-department"
                  >
                    <Select defaultValue="legal">
                      <SelectTrigger id="default-department" className="w-full">
                        <SelectValue
                          placeholder={messages.settings.workspace.selectDepartment}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="legal">{departmentLabels.legal}</SelectItem>
                        <SelectItem value="finance">{departmentLabels.finance}</SelectItem>
                        <SelectItem value="compliance">{departmentLabels.compliance}</SelectItem>
                        <SelectItem value="audit">{departmentLabels.audit}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  onClick={() => toast.success(messages.settings.account.saved)}
                >
                  <icons.save /> {messages.settings.account.save}
                </Button>
              </CardFooter>
            </Card>
          )}

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
                >
                  <div className="grid gap-2 sm:grid-cols-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        aria-pressed={theme === option.key}
                        onClick={() => setTheme(option.key)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                          theme === option.key
                            ? "border-primary bg-primary-soft/60 ring-1 ring-primary/40 dark:bg-primary/10"
                            : "border-border/70 bg-card hover:border-foreground/25"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                            option.previewClass
                          )}
                        >
                          {theme === option.key && (
                            <icons.check className="size-4 text-primary" />
                          )}
                        </span>
                        <span className="flex-1 text-sm font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
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
                  <icons.save /> {messages.settings.account.save}
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

          {active === "logs" && (
            <Card className="animate-fade-rise">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{messages.settings.logs.title}</CardTitle>
                  <CardDescription>{messages.settings.logs.description}</CardDescription>
                </div>
                <div className="flex gap-2">
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
              </CardHeader>
              <CardContent>
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
                          setLogPage((p) => Math.min(logPageCount, p + 1))
                        }
                      >
                        {messages.settings.logs.nextPage}
                        <icons.chevronRight />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "services" && (() => {
            const allServices = Object.values(serviceStates)
            const degradedCount = allServices.filter((s) => s.status === "degraded").length
            const downCount = allServices.filter((s) => s.status === "down" || s.status === "stopped").length

            const statusDot = (status: ServiceEntry["status"]) =>
              status === "operational"
                ? "bg-emerald-500"
                : status === "degraded"
                  ? "bg-amber-500"
                  : "bg-red-500"

            return (
              <div className="space-y-6">
                <Card className="animate-fade-rise">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle>{messages.settings.services.title}</CardTitle>
                        <CardDescription>{messages.settings.services.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {downCount > 0 && (
                          <Badge variant="destructive">{messages.settings.services.downServices(downCount)}</Badge>
                        )}
                        {degradedCount > 0 && (
                          <Badge variant="warning">{messages.settings.services.degradedServices(degradedCount)}</Badge>
                        )}
                        {downCount === 0 && degradedCount === 0 && (
                          <Badge variant="success">{messages.settings.services.allOperational}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                                <span>{messages.settings.services.responseTime}: <span className="font-medium tabular-nums">{service.responseTime > 0 ? `${service.responseTime} ms` : "—"}</span></span>
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
                  </CardContent>
                </Card>
              </div>
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
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-gradient-brand-soft p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-glow [&_svg]:size-5">
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
                      variant="gradient"
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
    </div>
  )
}
