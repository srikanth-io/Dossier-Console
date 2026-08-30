import { useParams, Link } from "react-router-dom"

import { EmptyState } from "@/components/common/empty-state"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { icons, messages, ROUTES } from "@/constants"
import { useProjects } from "@/store/projects"
import { useDocumentLibrary } from "@/store/documents"
import { usePages } from "@/store/pages"

export function ProjectOverview() {
  const { id } = useParams<{ id: string }>()
  const { getProject } = useProjects()
  const { getDocumentsByProject } = useDocumentLibrary()
  const { getPagesByProject } = usePages()

  const project = getProject(id ?? "")

  if (!project) {
    return (
      <EmptyState
        icon={<icons.dossiers />}
        title={messages.projects.detail.notFoundTitle}
        description={messages.projects.detail.notFoundDescription}
      />
    )
  }

  const progress = Math.round(
    (project.tasksCompleted / Math.max(1, project.tasksTotal)) * 100
  )

  const docCount = id ? getDocumentsByProject(id).length : 0
  const noteCount = id ? getPagesByProject(id).length : 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{messages.projects.detail.progress}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{progress}%</span>
              <span className="text-sm text-muted-foreground">
                {project.tasksCompleted}/{project.tasksTotal} tasks
              </span>
            </div>
            <Progress value={progress} variant={progress === 100 ? "success" : "default"} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{messages.projects.detail.totalHours}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{project.hoursLogged}</span>
              <span className="text-sm text-muted-foreground">
                / {project.estimatedHours} estimated
              </span>
            </div>
            <Progress
              value={(project.hoursLogged / Math.max(1, project.estimatedHours)) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{messages.projects.detail.teamSize}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{project.teamSize}</span>
              <span className="text-sm text-muted-foreground">members</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <h3 className="text-lg font-semibold">Quick Access</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to={`${ROUTES.projects}/${id}/documents`}>
          <Card className="transition-colors hover:border-primary/25 hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <icons.fileCode className="size-6" />
              </span>
              <div>
                <p className="font-semibold">Documents</p>
                <p className="text-sm text-muted-foreground">{docCount} document{docCount !== 1 ? "s" : ""}</p>
              </div>
              <icons.arrowRight className="ml-auto size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link to={`${ROUTES.projects}/${id}/notes`}>
          <Card className="transition-colors hover:border-primary/25 hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <icons.file className="size-6" />
              </span>
              <div>
                <p className="font-semibold">Notes</p>
                <p className="text-sm text-muted-foreground">{noteCount} page{noteCount !== 1 ? "s" : ""}</p>
              </div>
              <icons.arrowRight className="ml-auto size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link to={`${ROUTES.projects}/${id}/timesheet`}>
          <Card className="transition-colors hover:border-primary/25 hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <icons.pendingReviews className="size-6" />
              </span>
              <div>
                <p className="font-semibold">Timesheet</p>
                <p className="text-sm text-muted-foreground">{project.hoursLogged}h logged</p>
              </div>
              <icons.arrowRight className="ml-auto size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Project Info */}
      {(project.description || project.startDate || project.dueDate) && (
        <Card>
          <CardContent className="space-y-3 p-4">
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
            <div className="flex items-center gap-6 text-sm">
              {project.startDate && (
                <span className="text-muted-foreground">
                  {messages.projects.detail.startedOn}: <span className="font-medium text-foreground">{project.startDate}</span>
                </span>
              )}
              {project.dueDate && (
                <span className="text-muted-foreground">
                  {messages.projects.card.dueDate}: <span className="font-medium text-foreground">{project.dueDate}</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
