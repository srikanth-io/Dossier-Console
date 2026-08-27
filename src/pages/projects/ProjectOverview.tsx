import { useParams, Link } from "react-router-dom"

import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { Badge } from "@/components/ui/badge"
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

const statusVariant: Record<string, "success" | "warning" | "info" | "default" | "destructive"> = {
  active: "success",
  completed: "info",
  onHold: "warning",
  cancelled: "destructive",
  planning: "default",
}

export function ProjectOverview() {
  const { id } = useParams<{ id: string }>()
  const { getProject } = useProjects()
  const { getDocumentsByProject } = useDocumentLibrary()
  const { getPagesByProject } = usePages()

  const project = getProject(id ?? "")

  if (!project) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={<icons.dossiers />}
          title="Project not found"
          description="This project may have been deleted."
        />
      </div>
    )
  }

  const progress = Math.round(
    (project.tasksCompleted / Math.max(1, project.tasksTotal)) * 100
  )

  const docCount = id ? getDocumentsByProject(id).length : 0
  const noteCount = id ? getPagesByProject(id).length : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description || `Client: ${project.client}`}
        actions={
          <div className="flex gap-2">
            <Badge variant={statusVariant[project.status]}>
              {messages.projects.status[project.status]}
            </Badge>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Progress</CardTitle>
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
            <CardTitle className="text-sm text-muted-foreground">Hours</CardTitle>
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
            <CardTitle className="text-sm text-muted-foreground">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{project.teamSize}</span>
              <span className="text-sm text-muted-foreground">members</span>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {(project.startDate || project.dueDate) && (
        <Card>
          <CardContent className="flex items-center gap-6 p-4 text-sm">
            {project.startDate && (
              <span className="text-muted-foreground">
                Start: <span className="font-medium text-foreground">{project.startDate}</span>
              </span>
            )}
            {project.dueDate && (
              <span className="text-muted-foreground">
                Due: <span className="font-medium text-foreground">{project.dueDate}</span>
              </span>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
