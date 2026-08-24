import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { icons, messages } from "@/constants"
import { formatTimestamp } from "@/lib/time"
import { cn } from "@/lib/utils"

type ServiceKey = "database" | "auth" | "restApi" | "storage" | "realtime" | "edgeFunctions"

type ServiceStatus = "operational" | "down"

type ServiceResult = {
  key: ServiceKey
  endpoint: string
  status: ServiceStatus
  latencyMs: number
  detail?: string
}

const SERVICE_ENDPOINTS: Record<ServiceKey, string> = {
  database: "/rest/v1/",
  auth: "/auth/v1/health",
  restApi: "/rest/v1/",
  storage: "/storage/v1/status",
  realtime: "/realtime/v1/api/ping",
  edgeFunctions: "/functions/v1/",
}

/** Any HTTP response means the service is up; only network errors mean down. */
function reachable(res: Response): boolean {
  return res.status < 500
}

async function probe(
  url: string,
  path: string,
  apikey: string
): Promise<{ ok: boolean; latencyMs: number; json?: unknown }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  const startedAt = performance.now()
  try {
    const res = await fetch(`${url}${path}`, {
      headers: { apikey },
      signal: controller.signal,
    })
    const latencyMs = Math.round(performance.now() - startedAt)
    let json: unknown
    if (res.ok) {
      try {
        json = await res.json()
      } catch {
        // Non-JSON health payloads are fine.
      }
    }
    return { ok: reachable(res), latencyMs, json }
  } finally {
    clearTimeout(timeout)
  }
}

export function ServicesPanel() {
  const [results, setResults] = useState<ServiceResult[]>([])
  const [specVersion, setSpecVersion] = useState<string | null>(null)
  const [resources, setResources] = useState<string[]>([])
  const [projectUrl, setProjectUrl] = useState<string | null>(
    () => import.meta.env.VITE_SUPABASE_URL?.trim() || null
  )
  const [checking, setChecking] = useState(false)
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)
  const [unconfigured, setUnconfigured] = useState(!projectUrl)

  const runChecks = useCallback(async () => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
    const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
    if (!baseUrl || !apikey) {
      setUnconfigured(true)
      return
    }
    setProjectUrl(baseUrl)
    setChecking(true)

    const entries = Object.entries(SERVICE_ENDPOINTS) as [ServiceKey, string][]
    const settled = await Promise.allSettled(
      entries.map(([, path]) => probe(baseUrl, path, apikey))
    )

    const next: ServiceResult[] = []
    let version: string | null = null
    let paths: string[] = []

    settled.forEach((outcome, index) => {
      const key = entries[index][0]
      if (outcome.status === "rejected") {
        next.push({ key, endpoint: SERVICE_ENDPOINTS[key], status: "down", latencyMs: 0 })
        return
      }
      const { ok, latencyMs, json } = outcome.value
      if (key === "restApi" && json && typeof json === "object") {
        const spec = json as {
          info?: { version?: string }
          paths?: Record<string, unknown>
        }
        if (spec.info?.version) version = spec.info.version
        if (spec.paths) {
          paths = Object.keys(spec.paths)
            .map((p) => p.replace(/\{[^}]+\}$/, "").replace(/\/$/, ""))
            .filter((p) => p.length > 0 && !p.includes("{"))
        }
      }
      next.push({
        key,
        endpoint: SERVICE_ENDPOINTS[key],
        status: ok ? "operational" : "down",
        latencyMs,
      })
    })

    // Deduplicate the two REST probes into distinct logical rows.
    const seenRest = next.filter((r) => r.key === "restApi")
    if (seenRest.length > 0 && next.some((r) => r.key === "database")) {
      const rest = seenRest[0]
      const dbIndex = next.findIndex((r) => r.key === "database")
      const db = next[dbIndex]
      next[dbIndex] = {
        ...db,
        latencyMs: db.latencyMs || rest.latencyMs,
        detail: version ? `${messages.settings.services.version} ${version}` : undefined,
      }
    }

    setResults(next)
    setSpecVersion(version)
    setResources([...new Set(paths)].sort())
    setCheckedAt(new Date())
    setChecking(false)
  }, [])

  useEffect(() => {
    void runChecks()
  }, [runChecks])

  const downCount = results.filter((r) => r.status === "down").length

  const summary = useMemo(() => {
    if (checking || results.length === 0) return null
    if (downCount === 0) return messages.settings.services.allOperational
    return messages.settings.services.downServices(downCount)
  }, [checking, results.length, downCount])

  if (unconfigured) {
    return (
      <Card className="animate-fade-rise">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <icons.database className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{messages.settings.services.empty}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {summary ? (
          <Badge variant={downCount === 0 ? "success" : "warning"}>{summary}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">
            {messages.settings.services.checking}
          </span>
        )}
        <div className="flex items-center gap-3">
          {checkedAt && (
            <span className="text-xs text-muted-foreground">
              {messages.settings.services.lastChecked}: {formatTimestamp(checkedAt.toISOString())}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => void runChecks()} disabled={checking}>
            <icons.retry className={cn("size-3.5", checking && "animate-spin")} />
            {messages.settings.services.checkNow}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((service) => {
          const label =
            messages.settings.services[service.key as keyof typeof messages.settings.services]
          const description =
            messages.settings.services[
              `${service.key}Description` as keyof typeof messages.settings.services
            ]
          return (
            <Card key={service.key} className="animate-fade-rise">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm">{String(label)}</CardTitle>
                    {typeof description === "string" && (
                      <CardDescription className="mt-1 text-xs">
                        {description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={service.status === "operational" ? "success" : "destructive"}>
                    {service.status === "operational"
                      ? messages.settings.services.operational
                      : messages.settings.services.down}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center justify-between gap-2">
                  <span>{messages.settings.services.endpoint}</span>
                  <code className="font-mono text-[11px]">{service.endpoint}</code>
                </p>
                <p className="flex items-center justify-between gap-2">
                  <span>{messages.settings.services.responseTime}</span>
                  <span className="font-mono tabular-nums">
                    {service.latencyMs > 0 ? `${service.latencyMs} ms` : messages.settings.services.unreachable}
                  </span>
                </p>
                {service.detail && (
                  <p className="flex items-center justify-between gap-2">
                    <span>{messages.settings.services.details}</span>
                    <span className="font-mono text-[11px]">{service.detail}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {projectUrl && (
        <Card className="animate-fade-rise">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <icons.plug className="size-4" /> Supabase project
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-xs sm:grid-cols-2">
            <p className="flex items-center justify-between gap-2 sm:col-span-2">
              <span className="text-muted-foreground">{messages.settings.services.projectUrl}</span>
              <a
                href={`${projectUrl}/rest/v1/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
              >
                {projectUrl}
                <icons.arrowRight className="size-3" />
              </a>
            </p>
            {specVersion && (
              <p className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{messages.settings.services.apiVersion}</span>
                <code className="font-mono text-[11px]">{specVersion}</code>
              </p>
            )}
            <p className="flex items-center justify-between gap-2 sm:col-span-2">
              <span className="text-muted-foreground">{messages.settings.services.exposedTables}</span>
              <span className="font-medium">
                {resources.length > 0
                  ? messages.settings.services.tablesExposed(resources.length)
                  : messages.settings.services.noTables}
              </span>
            </p>
            {resources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:col-span-2">
                {resources.map((resource) => (
                  <code
                    key={resource}
                    className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[11px]"
                  >
                    {resource}
                  </code>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
