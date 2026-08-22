import { useState } from "react"
import { Link } from "react-router-dom"

import { PageHeader } from "@/components/common/page-header"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
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
import { Progress } from "@/components/ui/progress"
import { icons, messages, ROUTES } from "@/constants"
import { projects, type ProjectStatus } from "@/data/projects"

const statusVariant: Record<ProjectStatus, "success" | "warning" | "info" | "default" | "destructive"> = {
  active: "success",
  completed: "info",
  onHold: "warning",
  cancelled: "destructive",
  planning: "default",
}

export function Projects() {
  const [search, setSearch] = useState("")

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = projects.filter((p) => p.status === "active").length
  const completedCount = projects.filter((p) => p.status === "completed").length
  const totalHours = projects.reduce((sum, p) => sum + p.hoursLogged, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={messages.projects.eyebrow}
        title={messages.projects.title}
        description={messages.projects.subtitle}
        actions={
          <Button variant="default">
            <icons.plus /> {messages.projects.newProject}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: messages.projects.stats.totalProjects, value: String(projects.length), icon: "dossiers" as const, tone: "primary" as const },
          { label: messages.projects.stats.activeProjects, value: String(activeCount), icon: "activity" as const, tone: "success" as const },
          { label: messages.projects.stats.completedProjects, value: String(completedCount), icon: "checkCircle" as const, tone: "info" as const },
          { label: messages.projects.stats.totalHoursLogged, value: `${totalHours}`, icon: "pendingReviews" as const, tone: "warning" as const },
        ].map((stat, index) => {
          const Icon = icons[stat.icon]
          return (
            <div
              key={stat.label}
              className="animate-fade-rise"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Card size="sm">
                <CardContent className="flex items-center gap-3 py-4">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[18px] ${
                      stat.tone === "primary"
                        ? "bg-primary-soft/70 text-primary dark:bg-primary/15"
                        : stat.tone === "success"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : stat.tone === "info"
                            ? "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                    }`}
                  >
                    <Icon />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-heading text-xl font-extrabold tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      <SearchFilterBar
        query={search}
        onQueryChange={setSearch}
        placeholder={messages.projects.searchPlaceholder}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project, index) => {
          const progress = Math.round((project.tasksCompleted / project.tasksTotal) * 100)
          const Icon = icons[project.icon]

          return (
            <Link
              key={project.id}
              to={`${ROUTES.projects}/${project.id}`}
              className="group animate-fade-rise"
              style={{ animationDelay: `${(index + 4) * 60}ms` }}
            >
              <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition-transform duration-200 group-hover:scale-105 [&_svg]:size-5"
                        style={{ background: project.color }}
                      >
                        <Icon />
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {project.client}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={statusVariant[project.status]}>
                      {messages.projects.status[project.status]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {messages.projects.card.progress}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {project.tasksCompleted}/{project.tasksTotal} {messages.projects.card.tasks}
                      </span>
                    </div>
                    <Progress value={progress} variant={progress === 100 ? "success" : "default"} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <icons.pendingReviews className="size-3.5" />
                      {project.hoursLogged} {messages.projects.card.hoursLogged}
                    </span>
                    <span className="flex items-center gap-1">
                      <icons.users className="size-3.5" />
                      {project.teamSize} {messages.projects.card.team}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {project.dueDate
                      ? `${messages.projects.card.dueDate}: ${project.dueDate}`
                      : messages.projects.card.noDueDate}
                  </span>
                  <span className="flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {messages.projects.card.viewDetails}
                    <icons.arrowRight className="size-3.5" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="animate-fade-rise">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <icons.dossiers className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {messages.projects.emptyState}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
