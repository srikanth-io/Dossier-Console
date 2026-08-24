import { useMemo } from "react"
import { Link } from "react-router-dom"

import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { StatusPill, type StatusKey } from "@/components/domain/status-pill"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  commonMessages,
  icons,
  messages,
  ROUTES,
  statusLabels,
  theme,
} from "@/constants"
import type { TemplateCategory } from "@/document-engine/types"
import { formatRelative } from "@/lib/time"
import { useAuth } from "@/store/auth"
import { useDocumentLibrary } from "@/store/documents"
import { useProjects } from "@/store/projects"

const statTones = ["primary", "info", "warning", "success"] as const

const weekDayKeys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const typeLabel: Record<Exclude<TemplateCategory, "all">, string> = {
  resume: messages.dashboard.charts.typeResume,
  reports: messages.dashboard.charts.typeReports,
  study: messages.dashboard.charts.typeStudy,
  vapt: messages.dashboard.charts.typeVapt,
  business: messages.dashboard.charts.typeBusiness,
  education: messages.dashboard.charts.typeEducation,
  certificates: messages.dashboard.charts.typeCertificates,
  invoices: messages.dashboard.charts.typeInvoices,
  proposals: messages.dashboard.charts.typeProposals,
  custom: messages.dashboard.charts.typeCustom,
}

const statusKeyFor = (label: string): StatusKey | undefined =>
  (Object.keys(statusLabels) as (keyof typeof statusLabels)[]).find(
    (key) => statusLabels[key] === label
  )

const documentStatusLabel = (status: string): string =>
  status === "published"
    ? statusLabels.complete
    : status === "archived"
      ? statusLabels.archived
      : statusLabels.draft

const quickActions = [
  {
    icon: icons.templates,
    title: messages.dashboard.quickActions.templates.title,
    description: messages.dashboard.quickActions.templates.description,
    to: ROUTES.templates,
  },
  {
    icon: icons.dossiers,
    title: messages.dashboard.quickActions.documents.title,
    description: messages.dashboard.quickActions.documents.description,
    to: ROUTES.documents,
  },
  {
    icon: icons.fileCode,
    title: messages.dashboard.quickActions.resumeCreator.title,
    description: messages.dashboard.quickActions.resumeCreator.description,
    to: ROUTES.resumeCreator,
  },
  {
    icon: icons.settings,
    title: messages.dashboard.quickActions.settings.title,
    description: messages.dashboard.quickActions.settings.description,
    to: ROUTES.settings,
  },
]

export function Dashboard() {
  const { user } = useAuth()
  const { documents } = useDocumentLibrary()
  const { projects } = useProjects()

  // Every number below is derived from the signed-in user's own rows.
  const stats = useMemo(
    () => [
      { label: messages.dashboard.stats.totalDossiers, value: String(documents.length), hint: messages.dashboard.stats.hints.totalDossiers },
      { label: messages.dashboard.stats.drafts, value: String(documents.filter((d) => d.status === "draft").length), hint: messages.dashboard.stats.hints.drafts },
      { label: messages.dashboard.stats.publishedDocs, value: String(documents.filter((d) => d.status === "published").length), hint: messages.dashboard.stats.hints.publishedDocs },
      { label: messages.dashboard.stats.projects, value: String(projects.length), hint: messages.dashboard.stats.hints.projects },
    ],
    [documents, projects]
  )

  // Documents created per day of the current week (Mon..Sun).
  const weeklyCreated = useMemo(() => {
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    return weekDayKeys.map((_, index) => {
      const start = new Date(monday)
      start.setDate(monday.getDate() + index)
      const end = new Date(start)
      end.setDate(start.getDate() + 1)
      return documents.filter((doc) => {
        const created = new Date(doc.createdAt).getTime()
        return (
          !Number.isNaN(created) &&
          created >= start.getTime() &&
          created < end.getTime()
        )
      }).length
    })
  }, [documents])

  const documentTypes = useMemo(() => {
    const counts = new Map<Exclude<TemplateCategory, "all">, number>()
    for (const doc of documents) {
      if (doc.category === "all") continue
      counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
  }, [documents])

  const recentDossiers = useMemo(
    () =>
      documents.slice(0, 5).map((doc) => ({
        id: doc.id,
        subject: doc.name,
        owner: user?.name || user?.email || commonMessages.none,
        status: documentStatusLabel(doc.status),
        updated: formatRelative(doc.updatedAt),
      })),
    [documents, user]
  )

  const maxWeekly = Math.max(...weeklyCreated, 1)
  const typesTotal = documentTypes.reduce((sum, item) => sum + item.value, 0)
  return (
    <div className="space-y-6">
      <PageHeader
        title={messages.dashboard.title}
        description={messages.dashboard.subtitle}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={ROUTES.templates}>
                {messages.dashboard.actions.templates}
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link to={ROUTES.resumeCreator}>
                <icons.newDossier /> {messages.dashboard.newDossier}
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const tone = statTones[index % statTones.length]
          const statIcons = [icons.dossiers, icons.fileCode, icons.checkCircle, icons.activity]
          const Icon = statIcons[index % statIcons.length]
          return (
            <div
              key={stat.label}
              className="animate-fade-rise"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <StatCard
                title={stat.label}
                value={stat.value}
                hint={stat.hint}
                icon={<Icon />}
                iconTone={tone}
              />
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-fade-rise lg:col-span-2" style={{ animationDelay: "120ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{messages.dashboard.charts.weekly.title}</CardTitle>
              <CardDescription>
                {messages.dashboard.charts.weekly.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-end gap-3"
              role="img"
              aria-label={messages.dashboard.charts.weekly.title}
            >
              {weeklyCreated.map((value, index) => (
                <div
                  key={index}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs font-semibold tabular-nums">
                    {value}
                  </span>
                  <div className="flex h-36 w-full items-end rounded-lg bg-muted/40 px-1 dark:bg-input/20">
                    <div
                      className="w-full rounded-t-md transition-[height] duration-500"
                      style={{
                        height: `${Math.max(
                          8,
                          Math.round((value / maxWeekly) * 100)
                        )}%`,
                        background: theme.chartColors[0],
                        opacity: value === maxWeekly ? 1 : 0.72,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {messages.dashboard.charts.weekDays[index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 border-t border-foreground/5 pt-4">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: theme.chartColors[0] }}
              />
              <span className="text-xs text-muted-foreground">
                {messages.dashboard.charts.weeklyCreated}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-rise" style={{ animationDelay: "180ms" }}>
          <CardHeader>
            <CardTitle>{messages.dashboard.charts.types.title}</CardTitle>
            <CardDescription>
              {messages.dashboard.charts.types.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="relative size-32 shrink-0">
                <svg
                  viewBox="0 0 120 120"
                  className="size-full -rotate-90"
                  role="img"
                  aria-label={messages.dashboard.charts.types.title}
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    fill="none"
                    stroke="var(--color-muted)"
                    strokeWidth="18"
                  />
                  {(() => {
                    const circumference = 2 * Math.PI * 44
                    let offset = 0
                    return documentTypes.map((item, index) => {
                      const length = (item.value / typesTotal) * circumference
                      const circle = (
                        <circle
                          key={item.key}
                          cx="60"
                          cy="60"
                          r="44"
                          fill="none"
                          stroke={theme.chartColors[index % theme.chartColors.length]}
                          strokeWidth="18"
                          strokeDasharray={`${length} ${circumference - length}`}
                          strokeDashoffset={-offset}
                        />
                      )
                      offset += length
                      return circle
                    })
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-2xl font-extrabold tabular-nums">
                    {typesTotal}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {messages.dashboard.charts.typesTotal(typesTotal)}
                  </span>
                </div>
              </div>
              <ul className="w-full space-y-2.5">
                {documentTypes.map((item, index) => (
                  <li key={item.key} className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{
                        background:
                          theme.chartColors[index % theme.chartColors.length],
                      }}
                    />
                    <span className="flex-1 text-sm text-muted-foreground">
                      {typeLabel[item.key]}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-rise" style={{ animationDelay: "240ms" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{messages.dashboard.recent.title}</CardTitle>
            <CardDescription>{messages.dashboard.recent.description}</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.documents}>
              {messages.dashboard.recent.viewAll}
              <icons.arrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">{commonMessages.id}</TableHead>
                <TableHead scope="col">{commonMessages.subject}</TableHead>
                <TableHead scope="col">{commonMessages.owner}</TableHead>
                <TableHead scope="col">{commonMessages.status}</TableHead>
                <TableHead scope="col" className="text-right">
                  {commonMessages.updated}
                </TableHead>
                <TableHead scope="col" className="w-12">
                  <span className="sr-only">{messages.dashboard.recentView}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDossiers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>{d.subject}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.owner}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      status={statusKeyFor(d.status)}
                      label={d.status}
                    />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {d.updated}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-sm"
                      aria-label={messages.dashboard.recentView}
                    >
                      <Link to={ROUTES.documents}>
                        <icons.eye />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {recentDossiers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {messages.dashboard.emptyRecent}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="animate-fade-rise" style={{ animationDelay: "300ms" }}>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {messages.dashboard.quickActions.label}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.to}
                to={action.to}
                className="group rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105 [&_svg]:size-5">
                  <Icon />
                </span>
                <h3 className="mt-3 font-heading text-sm font-bold">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {action.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
