import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { commonMessages, icons, messages } from "@/constants"
import {
  securityEventCategory,
  securityEventLabel,
} from "@/constants/messages/security-events"
import { formatRelative, formatTimestamp } from "@/lib/time"
import { browserFromUserAgent, osFromUserAgent } from "@/lib/userAgent"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export type DeviceEventRow = {
  id: string
  event_type: string
  success: boolean
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

type DeviceEntry = {
  key: string
  browser: string
  os: string
  ip: string | null
  firstSeen: string
  lastSeen: string
  sessions: number
}

type LogLine = {
  id: string
  timestamp: string
  action: string
  category: string
  screen: string
  request: string
  details: string
}

function deviceKeyOf(ua: string | null): string {
  return `${browserFromUserAgent(ua)}|${osFromUserAgent(ua)}`
}

function toLogLines(events: DeviceEventRow[]): LogLine[] {
  return [...events]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((event) => {
      const meta = event.metadata ?? {}
      const metaString = (key: string): string | null =>
        typeof meta[key] === "string" ? (meta[key] as string) : null
      return {
        id: event.id,
        timestamp: formatTimestamp(event.created_at),
        action: securityEventLabel(event.event_type),
        category: securityEventCategory(event.event_type),
        screen: metaString("screen") ?? commonMessages.none,
        request: metaString("request") ?? commonMessages.none,
        details: metaString("details") ?? commonMessages.none,
      }
    })
}

export function DevicesPanel({ events }: { events: DeviceEventRow[] }) {
  const [logsOpenFor, setLogsOpenFor] = useState<DeviceEntry | null>(null)

  const devices = useMemo<DeviceEntry[]>(() => {
    const byKey = new Map<string, DeviceEntry>()
    // Events arrive newest-first; the first occurrence wins for last-seen/IP.
    for (const event of events) {
      const key = deviceKeyOf(event.user_agent)
      const existing = byKey.get(key)
      if (!existing) {
        byKey.set(key, {
          key,
          browser: browserFromUserAgent(event.user_agent),
          os: osFromUserAgent(event.user_agent),
          ip: event.ip_address,
          firstSeen: event.created_at,
          lastSeen: event.created_at,
          sessions: 1,
        })
        continue
      }
      existing.sessions += 1
      if (!existing.ip && event.ip_address) existing.ip = event.ip_address
      if (event.created_at > existing.lastSeen) existing.lastSeen = event.created_at
      if (event.created_at < existing.firstSeen) existing.firstSeen = event.created_at
    }
    return [...byKey.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
  }, [events])

  const currentKey = useMemo(
    () => deviceKeyOf(typeof navigator === "undefined" ? null : navigator.userAgent),
    []
  )

  const activeLogLines = useMemo(
    () => (logsOpenFor ? toLogLines(events.filter((e) => deviceKeyOf(e.user_agent) === logsOpenFor.key)) : []),
    [logsOpenFor, events]
  )

  const exportLogs = () => {
    const header = "Timestamp,Action,Category,Screen,Request,Details\n"
    const csv = activeLogLines.map((l) =>
      `${l.timestamp},"${l.action}",${l.category},${l.screen},"${l.request}","${l.details}"`
    ).join("\n")
    const blob = new Blob([header + csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `device-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(messages.settings.logs.exported)
  }

  return (
    <>
      <Card className="animate-fade-rise">
        <CardHeader>
          <CardTitle>{messages.settings.devices.title}</CardTitle>
          <CardDescription>{messages.settings.devices.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <icons.apple className="mb-3 size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {messages.settings.devices.empty}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {devices.map((device) => {
                const isCurrent = device.key === currentKey
                const Icon = device.os === "Windows" || device.os === "macOS" || device.os === "Linux"
                  ? icons.monitor
                  : icons.apple
                return (
                  <li
                    key={device.key}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border p-4",
                      isCurrent
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/70 bg-card"
                    )}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">
                      <Icon />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {device.browser} · {device.os}
                        </p>
                        {isCurrent && (
                          <Badge variant="success">{messages.settings.devices.currentDevice}</Badge>
                        )}
                        <Badge variant="info">
                          {messages.settings.devices.sessions(device.sessions)}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {messages.settings.devices.ipAddress}:{" "}
                        <span className="font-mono tabular-nums">
                          {device.ip ?? messages.settings.devices.unknown}
                        </span>
                        {" · "}
                        {messages.settings.devices.firstSeen} {formatRelative(device.firstSeen)}
                        {" · "}
                        {messages.settings.devices.lastSeen} {formatRelative(device.lastSeen)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLogsOpenFor(device)}
                    >
                      <icons.file className="size-3.5" /> {messages.settings.devices.viewLogs}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={logsOpenFor !== null} onOpenChange={(open) => !open && setLogsOpenFor(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {logsOpenFor &&
                messages.settings.devices.logsTitle(`${logsOpenFor.browser} · ${logsOpenFor.os}`)}
            </DialogTitle>
            <DialogDescription>{messages.settings.devices.logsDescription}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{messages.settings.logs.timestamp}</TableHead>
                  <TableHead scope="col">{messages.settings.logs.action}</TableHead>
                  <TableHead scope="col">{messages.settings.logs.screen}</TableHead>
                  <TableHead scope="col">{messages.settings.logs.request}</TableHead>
                  <TableHead scope="col">{messages.settings.logs.details}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeLogLines.map((log) => (
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
                    <TableCell className="text-xs font-mono text-muted-foreground">{log.request}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{log.details}</TableCell>
                  </TableRow>
                ))}
                {activeLogLines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {messages.settings.logs.empty}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button variant="outline" size="sm" onClick={exportLogs} disabled={activeLogLines.length === 0}>
              <icons.download className="size-4" /> {messages.settings.logs.export}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
