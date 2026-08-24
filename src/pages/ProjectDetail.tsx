import { useCallback, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { PageHeader } from "@/components/common/page-header"
import { DateField } from "@/components/common/date-field"
import { EmptyState } from "@/components/common/empty-state"
import { ProjectFolderManager } from "@/components/projects/project-folder-manager"
import { ProjectFormDialog } from "@/components/projects/project-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { TimePicker } from "@/components/common/time-picker"
import { icons, messages, ROUTES } from "@/constants"
import { taskTypes } from "@/data/projects"
import { toast } from "sonner"
import { useProjects, type TimeEntry } from "@/store/projects"

const priorityVariant: Record<TimeEntry["priority"], "destructive" | "warning" | "default"> = {
  high: "destructive",
  medium: "warning",
  low: "default",
}

const statusVariant: Record<string, "success" | "warning" | "info" | "default" | "destructive"> = {
  active: "success",
  completed: "info",
  onHold: "warning",
  cancelled: "destructive",
  planning: "default",
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function recalcHours(entry: TimeEntry): TimeEntry {
  if (entry.startTime && entry.endTime) {
    const [sh, sm] = entry.startTime.split(":").map(Number)
    const [eh, em] = entry.endTime.split(":").map(Number)
    const mins = eh * 60 + em - (sh * 60 + sm) - entry.breakMinutes
    return { ...entry, hours: Math.max(0, Math.round((mins / 60) * 10) / 10) }
  }
  return entry
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProject, getTimeEntries, deleteProject, upsertTimeEntry, removeTimeEntry } =
    useProjects()
  const project = getProject(id ?? "")

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [remarks, setRemarks] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const dateKey = toDateKey(selectedDate)
  const dayEntries = useMemo(
    () => getTimeEntries(id ?? "").filter((entry) => entry.date === dateKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getTimeEntries, id, dateKey]
  )

  const dailyTotal = dayEntries.reduce((sum, t) => sum + t.hours, 0)

  const handleAddTask = () => {
    if (!id) return
    upsertTimeEntry({
      id: crypto.randomUUID(),
      projectId: id,
      date: dateKey,
      task: taskTypes[0],
      description: "",
      startTime: "09:00",
      endTime: "17:00",
      breakMinutes: 0,
      hours: 8,
      status: "inProgress",
      priority: "medium",
    })
  }

  const handleUpdateTask = useCallback(
    (taskId: string, field: keyof TimeEntry, value: string | number) => {
      const source = getTimeEntries(id ?? "").find((t) => t.id === taskId)
      if (!source) return
      let updated: TimeEntry = { ...source, [field]: value }
      if (field === "startTime" || field === "endTime" || field === "breakMinutes") {
        updated = recalcHours(updated)
      }
      upsertTimeEntry(updated)
    },
    [id, getTimeEntries, upsertTimeEntry]
  )

  const handleRemoveTask = (taskId: string) => {
    removeTimeEntry(taskId)
  }

  const setDayStatus = (status: TimeEntry["status"]) => {
    dayEntries.forEach((entry) => {
      if (entry.status !== status) upsertTimeEntry({ ...entry, status })
    })
  }

  const handleSubmit = () => {
    setDayStatus("completed")
    toast.success(messages.projects.timesheet.submitToast)
  }

  const handleSaveDraft = () => {
    setDayStatus("inProgress")
    toast.success(messages.projects.timesheet.draftSavedToast)
  }

  const handleDeleteProject = () => {
    if (!id) return
    deleteProject(id)
    setDeleteOpen(false)
    toast.success(messages.projects.form.deletedToast)
    navigate(ROUTES.projects)
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader title={messages.projects.detail.notFoundTitle} />
        <EmptyState
          className="animate-fade-rise"
          icon={<icons.alertCircle />}
          title={messages.projects.detail.notFoundTitle}
          description={messages.projects.detail.notFoundDescription}
          action={
            <Button asChild variant="outline">
              <Link to={ROUTES.projects}>{messages.projects.detail.back}</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const progress = Math.round((project.tasksCompleted / Math.max(1, project.tasksTotal)) * 100)
  const hoursProgress = Math.round((project.hoursLogged / Math.max(1, project.estimatedHours)) * 100)
  const Icon = icons[project.icon]

  return (
    <div className="space-y-6">
      <PageHeader
        className="animate-fade-rise"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={ROUTES.projects}>{messages.projects.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        title={project.name}
        description={project.description}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[project.status]}>
              {messages.projects.status[project.status]}
            </Badge>
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <icons.pencil className="size-4" /> {messages.projects.detail.edit}
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <icons.trash className="size-4" /> {messages.projects.detail.deleteProject}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: messages.projects.detail.totalHours, value: `${project.hoursLogged}h`, icon: "pendingReviews" as const, tone: "primary" as const },
          { label: messages.projects.detail.tasksCompleted, value: `${project.tasksCompleted}/${project.tasksTotal}`, icon: "checkCircle" as const, tone: "success" as const },
          { label: messages.projects.detail.hoursUsed, value: `${hoursProgress}%`, icon: "chart" as const, tone: "warning" as const },
          { label: messages.projects.detail.teamSize, value: `${project.teamSize}`, icon: "users" as const, tone: "info" as const },
        ].map((stat, index) => {
          const SIcon = icons[stat.icon]
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
                    <SIcon />
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

      <ProjectFolderManager projectId={project.id} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="animate-fade-rise xl:col-span-2" style={{ animationDelay: "240ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white [&_svg]:size-4.5"
                style={{ background: project.color }}
              >
                <Icon />
              </span>
              <div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  {project.client} &middot; {messages.projects.detail.startedOn} {project.startDate}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{messages.projects.card.progress}</span>
                <span className="font-semibold tabular-nums">{progress}%</span>
              </div>
              <Progress value={progress} variant={progress === 100 ? "success" : "default"} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{messages.projects.detail.hoursBudget}</span>
                <span className="font-semibold tabular-nums">{project.hoursLogged}/{project.estimatedHours}h</span>
              </div>
              <Progress value={hoursProgress} variant={hoursProgress > 90 ? "warning" : "default"} />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-rise" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle>{messages.projects.detail.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            {getTimeEntries(id ?? "").length === 0 ? (
              <p className="text-xs text-muted-foreground">{messages.projects.detail.noEntries}</p>
            ) : (
              <ul className="space-y-3">
                {getTimeEntries(id ?? "").slice(0, 4).map((entry) => (
                  <li key={entry.id} className="flex items-start gap-2.5">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{entry.description || entry.task}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {entry.date} &middot; {entry.hours}h &middot; {entry.startTime}–{entry.endTime}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-rise" style={{ animationDelay: "360ms" }}>
        <CardHeader>
          <CardTitle>{messages.projects.detail.entries}</CardTitle>
          <CardDescription>{messages.projects.detail.trackTime}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timesheet">
            <TabsList variant="line" className="mb-4">
              <TabsTrigger value="timesheet">{messages.projects.timesheet.title}</TabsTrigger>
              <TabsTrigger value="history">{messages.projects.detail.history}</TabsTrigger>
            </TabsList>

            <TabsContent value="timesheet" className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label>{messages.projects.timesheet.date}</Label>
                  <DateField
                    className="w-[240px]"
                    value={selectedDate}
                    onChange={(day) => {
                      if (day) setSelectedDate(day)
                    }}
                    ariaLabel={messages.projects.timesheet.date}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {dayEntries.map((task, index) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {messages.projects.detail.taskN} {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTask(task.id)}
                        className="h-7 text-destructive hover:text-destructive"
                      >
                        <icons.trash className="size-3.5" /> {messages.projects.timesheet.removeTask}
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.task}</Label>
                        <Select value={task.task} onValueChange={(v) => handleUpdateTask(task.id, "task", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder={messages.projects.detail.selectTask} />
                          </SelectTrigger>
                          <SelectContent>
                            {taskTypes.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.description}</Label>
                        <Input
                          value={task.description}
                          onChange={(e) => handleUpdateTask(task.id, "description", e.target.value)}
                          placeholder={messages.projects.detail.descriptionPlaceholder}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.priority}</Label>
                        <Select value={task.priority} onValueChange={(v) => handleUpdateTask(task.id, "priority", v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">{messages.projects.timesheet.high}</SelectItem>
                            <SelectItem value="medium">{messages.projects.timesheet.medium}</SelectItem>
                            <SelectItem value="low">{messages.projects.timesheet.low}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.totalHours}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={task.hours}
                          onChange={(e) => handleUpdateTask(task.id, "hours", Number(e.target.value))}
                          className="font-semibold tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.startTime}</Label>
                        <TimePicker
                          value={task.startTime}
                          onChange={(v) => handleUpdateTask(task.id, "startTime", v)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.endTime}</Label>
                        <TimePicker
                          value={task.endTime}
                          onChange={(v) => handleUpdateTask(task.id, "endTime", v)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.breakMinutes}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="15"
                          value={task.breakMinutes}
                          onChange={(e) => handleUpdateTask(task.id, "breakMinutes", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={handleAddTask}>
                <icons.plus className="size-4" /> {messages.projects.timesheet.addTask}
              </Button>

              <div className="flex flex-wrap items-end gap-3 border-t border-border/60 pt-4">
                <div className="flex-1">
                  <Label>{messages.projects.timesheet.remarks}</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={messages.projects.detail.remarksPlaceholder}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{messages.projects.timesheet.dailyTotal}</p>
                    <p className="font-heading text-xl font-extrabold tabular-nums">{dailyTotal}h</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <icons.save className="size-4" /> {messages.projects.timesheet.saveDraft}
                </Button>
                <Button variant="default" onClick={handleSubmit}>
                  <icons.check className="size-4" /> {messages.projects.timesheet.submit}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history">
              {getTimeEntries(id ?? "").length === 0 ? (
                <EmptyState
                  className="animate-fade-rise"
                  icon={<icons.pendingReviews />}
                  title={messages.projects.detail.noEntries}
                  description={messages.projects.detail.trackTime}
                  action={
                    <Button variant="outline" size="sm" onClick={handleAddTask}>
                      <icons.plus className="size-4" /> {messages.projects.timesheet.addTask}
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">{messages.projects.timesheet.date}</TableHead>
                      <TableHead scope="col">{messages.projects.timesheet.task}</TableHead>
                      <TableHead scope="col">{messages.projects.timesheet.description}</TableHead>
                      <TableHead scope="col">{messages.projects.timesheet.startTime}</TableHead>
                      <TableHead scope="col">{messages.projects.timesheet.endTime}</TableHead>
                      <TableHead scope="col" className="text-right">{messages.projects.timesheet.totalHours}</TableHead>
                      <TableHead scope="col">{messages.projects.timesheet.status}</TableHead>
                      <TableHead scope="col">{messages.projects.timesheet.priority}</TableHead>
                      <TableHead scope="col" aria-label={messages.projects.detail.deleteProject} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getTimeEntries(id ?? "").map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.date}</TableCell>
                        <TableCell>{entry.task}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                        <TableCell className="tabular-nums">{entry.startTime}</TableCell>
                        <TableCell className="tabular-nums">{entry.endTime}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">{entry.hours}h</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === "completed" ? "success" : entry.status === "inProgress" ? "warning" : "default"}>
                            {messages.projects.timesheet[entry.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityVariant[entry.priority]}>
                            {messages.projects.timesheet[entry.priority]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={messages.projects.detail.deleteProject}
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeTimeEntry(entry.id)}
                          >
                            <icons.trash />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={project}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{messages.projects.deleteDialog.title}</DialogTitle>
            <DialogDescription>{messages.projects.deleteDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {messages.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              <icons.trash /> {messages.projects.deleteDialog.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
