import { useMemo } from "react"
import { Link } from "react-router-dom"

import { PageHeader } from "@/components/common/page-header"
import { AnimatedListDemo } from "@/components/common/animated-list-demo"
import { AnimatedBeamDemo } from "@/components/common/animated-beam-demo"
import { StatusPill, type StatusKey } from "@/components/domain/status-pill"
import { BlurFade } from "@/components/ui/blur-fade"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { Marquee } from "@/components/ui/marquee"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

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

export function Dashboard() {
  const { user } = useAuth()
  const { documents } = useDocumentLibrary()
  const { projects } = useProjects()

  const stats = useMemo(
    () => [
      { label: messages.dashboard.stats.totalDossiers, value: String(documents.length), hint: messages.dashboard.stats.hints.totalDossiers },
      { label: messages.dashboard.stats.drafts, value: String(documents.filter((d) => d.status === "draft").length), hint: messages.dashboard.stats.hints.drafts },
      { label: messages.dashboard.stats.publishedDocs, value: String(documents.filter((d) => d.status === "published").length), hint: messages.dashboard.stats.hints.publishedDocs },
      { label: messages.dashboard.stats.projects, value: String(projects.length), hint: messages.dashboard.stats.hints.projects },
    ],
    [documents, projects]
  )

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

  const typesTotal = documentTypes.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={messages.dashboard.title}
        description={messages.dashboard.subtitle}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={ROUTES.resumes}>
                {messages.dashboard.actions.templates}
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link to={ROUTES.resumeBuilder}>
                <icons.newDossier /> {messages.dashboard.newDossier}
              </Link>
            </Button>
          </>
        }
      />

      {/* Bento Grid */}
      <BlurFade delay={0.1} inView>
        <BentoGrid>
        {/* Stats Card — spans 1 col */}
        <BentoCard
          name="Overview"
          description={`${stats[0].value} total dossiers`}
          Icon={icons.dossiers}
          className="col-span-3 md:col-span-1"
          background={
            <div className="mb-4 grid grid-cols-2 gap-3">
              {stats.map((stat, index) => {
                const statIcons = [icons.dossiers, icons.fileCode, icons.checkCircle, icons.activity]
                const StatIcon = statIcons[index % statIcons.length]
                return (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <StatIcon className="size-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className="mt-1 font-heading text-xl font-extrabold">{stat.value}</p>
                  </div>
                )
              })}
            </div>
          }
        />

        {/* Activity List — spans 2 cols */}
        <BentoCard
          name="Recent Activity"
          description="Latest document updates"
          Icon={icons.notifications}
          className="col-span-3 md:col-span-2"
          background={
            <div className="absolute inset-0 top-4 overflow-hidden [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
              <AnimatedListDemo className="scale-90" />
            </div>
          }
        />

        {/* Quick Actions — spans 2 cols */}
        <BentoCard
          name="Quick Actions"
          description="Jump to any workspace"
          Icon={icons.sparkles}
          className="col-span-3 md:col-span-2"
          background={<AnimatedBeamDemo className="absolute top-6 right-4 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]" />}
        />

        {/* Calendar — spans 1 col */}
        <BentoCard
          name="Calendar"
          description="Schedule overview"
          Icon={icons.pendingReviews}
          className="col-span-3 md:col-span-1"
          background={
            <Calendar
              mode="single"
              selected={new Date()}
              className="absolute top-8 right-0 origin-top scale-75 rounded-md border [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
            />
          }
        />

        {/* Document Types Marquee — spans 2 cols */}
        <BentoCard
          name="Document Types"
          description={`${typesTotal} documents across ${documentTypes.length} categories`}
          Icon={icons.openFile}
          className="col-span-3 md:col-span-2"
          background={
            <Marquee
              pauseOnHover
              className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
            >
              {documentTypes.map((item, idx) => (
                <figure
                  key={item.key}
                  className={cn(
                    "relative w-36 cursor-pointer overflow-hidden rounded-xl border p-4",
                    "border-border/50 bg-muted/20 hover:bg-muted/40",
                    "transform-gpu blur-[0.5px] transition-all duration-300 ease-out hover:blur-none"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ background: theme.chartColors[idx % theme.chartColors.length] }}
                    />
                    <span className="text-sm font-medium">{typeLabel[item.key]}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.value} documents</p>
                </figure>
              ))}
            </Marquee>
          }
        />

        {/* Projects — spans 1 col */}
        <BentoCard
          name="Projects"
          description={`${projects.length} active projects`}
          Icon={icons.dossiers}
          className="col-span-3 md:col-span-1"
          background={
            <div className="absolute top-10 right-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="font-heading text-3xl font-extrabold text-primary">{projects.length}</span>
              </div>
            </div>
          }
        />
      </BentoGrid>
      </BlurFade>

      {/* Recent Documents Table */}
      <BlurFade delay={0.2} inView>
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-bold">{messages.dashboard.recent.title}</h3>
            <p className="text-sm text-muted-foreground">{messages.dashboard.recent.description}</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.resumes}>
              {messages.dashboard.recent.viewAll}
              <icons.arrowRight />
            </Link>
          </Button>
        </div>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDossiers.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.id}</TableCell>
                <TableCell>{d.subject}</TableCell>
                <TableCell className="text-muted-foreground">{d.owner}</TableCell>
                <TableCell>
                  <StatusPill status={statusKeyFor(d.status)} label={d.status} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{d.updated}</TableCell>
              </TableRow>
            ))}
            {recentDossiers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {messages.dashboard.emptyRecent}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      </BlurFade>
    </div>
  )
}
