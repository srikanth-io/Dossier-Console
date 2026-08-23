import { useCallback, useState } from "react"
import { Link } from "react-router-dom"

import { PageHeader } from "@/components/common/page-header"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/common/empty-state"
import { CollectionGrid, CollectionSection } from "@/components/common/collection-page"
import { ProjectFormDialog } from "@/components/projects/project-form-dialog"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { icons, messages, ROUTES } from "@/constants"
import type { ProjectStatus } from "@/data/projects"
import { useProjects, type Project } from "@/store/projects"

const statusVariant: Record<ProjectStatus, "success" | "warning" | "info" | "default" | "destructive"> = {
  active: "success",
  completed: "info",
  onHold: "warning",
  cancelled: "destructive",
  planning: "default",
}

export function Projects() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all")
  const { projects, deleteProject } = useProjects()
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const openCreate = useCallback(() => {
    setEditingProject(undefined)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((project: Project) => {
    setEditingProject(project)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return
    deleteProject(deleteTarget.id)
    setDeleteTarget(null)
  }, [deleteTarget, deleteProject])

  const filtered = projects.filter((project) => {
    if (statusFilter !== "all" && project.status !== statusFilter) return false
    return (
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.client.toLowerCase().includes(search.toLowerCase())
    )
  })

  const hasActiveFilters = search !== "" || statusFilter !== "all"

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={messages.projects.eyebrow}
        title={messages.projects.title}
        description={messages.projects.subtitle}
        actions={
          <Button variant="default" onClick={openCreate}>
            <icons.plus /> {messages.projects.newProject}
          </Button>
        }
      />

      <SearchFilterBar
        query={search}
        onQueryChange={setSearch}
        placeholder={messages.projects.searchPlaceholder}
      >
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as "all" | ProjectStatus)}
        >
          <SelectTrigger className="w-40" aria-label={messages.projects.filterStatus}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{messages.projects.allStatuses}</SelectItem>
            {(["planning", "active", "onHold", "completed", "cancelled"] as const).map(
              (key) => (
                <SelectItem key={key} value={key}>
                  {messages.projects.status[key]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </SearchFilterBar>

      <CollectionSection
        title={messages.projects.title}
        description={messages.projects.count(filtered.length)}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={hasActiveFilters ? <icons.search /> : <icons.dossiers />}
            title={
              hasActiveFilters
                ? messages.projects.emptyFilteredTitle
                : messages.projects.emptyTitle
            }
            description={
              hasActiveFilters ? undefined : messages.projects.emptyHint
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  <icons.close /> {messages.dossiers.clearFilters}
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <icons.plus /> {messages.projects.newProject}
                </Button>
              )
            }
          />
        ) : (
          <CollectionGrid>
            {filtered.map((project, index) => {
          const progress = Math.round(
            (project.tasksCompleted / Math.max(1, project.tasksTotal)) * 100
          )
          const Icon = icons[project.icon]

          return (
            <div
              key={project.id}
              className="group relative animate-fade-rise"
              style={{ animationDelay: `${(index + 4) * 60}ms` }}
            >
              <Link
                to={`${ROUTES.projects}/${project.id}`}
                className="block h-full"
              >
                <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-md">
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
                      <Badge variant={statusVariant[project.status]} className="mr-7 shrink-0">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={project.name}
                    className="absolute right-2 top-2 z-10 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                  >
                    <icons.moreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(project)}>
                    <icons.pencil className="size-4" />
                    {messages.projects.detail.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(project)}
                  >
                    <icons.trash className="size-4" />
                    {messages.projects.detail.deleteProject}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
          </CollectionGrid>
        )}
      </CollectionSection>

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editingProject}
      />

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{messages.projects.deleteDialog.title}</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name} — {messages.projects.deleteDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {messages.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <icons.trash /> {messages.projects.deleteDialog.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
