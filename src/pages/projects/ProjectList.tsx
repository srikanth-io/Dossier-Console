import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/common/empty-state"
import { SearchFilterBar } from "@/components/common/search-filter-bar"
import { CollectionGrid, CollectionSection } from "@/components/common/collection-page"
import { ProjectFormDialog } from "@/components/projects/project-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { icons, messages, ROUTES } from "@/constants"
import { useProjects, type Project, type ProjectStatus } from "@/store/projects"
import { toast } from "sonner"

const statusVariant: Record<string, "success" | "warning" | "info" | "default" | "destructive"> = {
  active: "success",
  completed: "info",
  onHold: "warning",
  cancelled: "destructive",
  planning: "default",
}

export function ProjectList() {
  const navigate = useNavigate()
  const { projects, deleteProject } = useProjects()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const filtered = useMemo(() => {
    let list = projects
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter)
    }
    return list
  }, [projects, search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{messages.projects.title}</h1>
          <p className="text-sm text-muted-foreground">{messages.projects.subtitle}</p>
        </div>
        <Button onClick={() => { setEditingProject(undefined); setFormOpen(true) }}>
          <icons.plus className="size-4" /> {messages.projects.newProject}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <SearchFilterBar
          query={search}
          onQueryChange={setSearch}
          placeholder={messages.projects.searchPlaceholder}
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={messages.projects.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{messages.projects.allStatuses}</SelectItem>
            {Object.entries(messages.projects.status).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CollectionSection title={messages.projects.title} description={`${filtered.length} project${filtered.length !== 1 ? "s" : ""}`}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<icons.dossiers />}
            title={search || statusFilter !== "all" ? messages.projects.emptyFilteredTitle : messages.projects.emptyTitle}
            description={messages.projects.emptyHint}
            action={
              <Button onClick={() => { setEditingProject(undefined); setFormOpen(true) }}>
                <icons.plus className="size-4" /> {messages.projects.newProject}
              </Button>
            }
          />
        ) : (
          <CollectionGrid>
            {filtered.map((project) => {
              const progress = Math.round((project.tasksCompleted / Math.max(1, project.tasksTotal)) * 100)
              return (
                <Card
                  key={project.id}
                  className="group cursor-pointer transition-colors hover:border-primary/25 hover:bg-muted/50"
                  onClick={() => navigate(`${ROUTES.projects}/${project.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: project.color || "hsl(var(--primary))" }}
                        >
                          {(() => { const Ic = icons[project.icon]; return <Ic className="size-5" /> })()}
                        </span>
                        <div>
                          <p className="font-semibold">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.client}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                            <icons.menu className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingProject(project); setFormOpen(true) }}>
                            <icons.settings className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteTarget(project) }} className="text-destructive">
                            <icons.trash className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {project.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                    )}

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{messages.projects.card.progress}</span>
                        <span className="font-medium tabular-nums">{progress}%</span>
                      </div>
                      <Progress value={progress} className="mt-1" />
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{project.hoursLogged} / {project.estimatedHours} {messages.projects.card.hoursLogged}</span>
                      <span>{messages.projects.card.team}: {project.teamSize}</span>
                      {project.dueDate && (
                        <span className="ml-auto">{messages.projects.card.dueDate}: {project.dueDate}</span>
                      )}
                    </div>

                    <Badge variant={statusVariant[project.status]} className="mt-2">
                      {messages.projects.status[project.status]}
                    </Badge>
                  </CardContent>
                </Card>
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

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.projects.deleteDialog.title}</DialogTitle>
            <DialogDescription>{messages.projects.deleteDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  deleteProject(deleteTarget.id)
                  toast.success(messages.projects.form.deletedToast)
                  setDeleteTarget(null)
                }
              }}
            >
              {messages.projects.deleteDialog.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
