import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { icons, messages, ROUTES } from "@/constants"
import { projects, timeEntries } from "@/data/projects"

type TaskRow = {
  id: string
  task: string
  description: string
  startTime: string
  endTime: string
  breakMinutes: number
  hours: number
  priority: "high" | "medium" | "low"
}

const priorityVariant: Record<string, "destructive" | "warning" | "default"> = {
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

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const project = projects.find((p) => p.id === id)
  const projectEntries = timeEntries.filter((e) => e.projectId === id)

  const [tasks, setTasks] = useState<TaskRow[]>([
    { id: "1", task: "Development", description: "", startTime: "09:30", endTime: "12:00", breakMinutes: 0, hours: 2.5, priority: "high" },
  ])
  const [remarks, setRemarks] = useState("")
  const [selectedDate, setSelectedDate] = useState("2026-08-17")

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader title="Project not found" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <icons.alertCircle className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">This project does not exist.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to={ROUTES.projects}>{messages.projects.detail.back}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = Math.round((project.tasksCompleted / project.tasksTotal) * 100)
  const hoursProgress = Math.round((project.hoursLogged / project.estimatedHours) * 100)
  const Icon = icons[project.icon]
  const dailyTotal = tasks.reduce((sum, t) => sum + t.hours, 0)

  const addTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        task: "",
        description: "",
        startTime: "",
        endTime: "",
        breakMinutes: 0,
        hours: 0,
        priority: "medium",
      },
    ])
  }

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const updateTask = (taskId: string, field: keyof TaskRow, value: string | number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const updated = { ...t, [field]: value }
        if ((field === "startTime" || field === "endTime" || field === "breakMinutes") && updated.startTime && updated.endTime) {
          const [sh, sm] = updated.startTime.split(":").map(Number)
          const [eh, em] = updated.endTime.split(":").map(Number)
          const mins = eh * 60 + em - (sh * 60 + sm) - updated.breakMinutes
          updated.hours = Math.max(0, Math.round((mins / 60) * 10) / 10)
        }
        return updated
      })
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-rise">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to={ROUTES.projects}>
            <icons.arrowLeft className="size-4" /> {messages.projects.detail.back}
          </Link>
        </Button>
        <PageHeader
          title={project.name}
          description={project.description}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[project.status]}>
                {messages.projects.status[project.status]}
              </Badge>
              <Button variant="gradient">
                <icons.play /> {messages.projects.detail.timesheet}
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: messages.projects.detail.totalHours, value: `${project.hoursLogged}h`, icon: "pendingReviews" as const, tone: "primary" as const },
          { label: messages.projects.detail.tasksCompleted, value: `${project.tasksCompleted}/${project.tasksTotal}`, icon: "checkCircle" as const, tone: "success" as const },
          { label: "Hours Used", value: `${hoursProgress}%`, icon: "chart" as const, tone: "warning" as const },
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
                <CardDescription>{project.client} &middot; Started {project.startDate}</CardDescription>
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
                <span className="text-muted-foreground">Hours Budget</span>
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
            {projectEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">{messages.projects.detail.noEntries}</p>
            ) : (
              <ul className="space-y-3">
                {projectEntries.slice(0, 4).map((entry) => (
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
          <CardDescription>Track your time for this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timesheet">
            <TabsList variant="line" className="mb-4">
              <TabsTrigger value="timesheet">{messages.projects.timesheet.title}</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="timesheet" className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ts-date">{messages.projects.timesheet.date}</Label>
                  <Input
                    id="ts-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Task {index + 1}
                      </span>
                      {tasks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(task.id)}
                          className="h-7 text-destructive hover:text-destructive"
                        >
                          <icons.trash className="size-3.5" /> {messages.projects.timesheet.removeTask}
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.task}</Label>
                        <Select value={task.task} onValueChange={(v) => updateTask(task.id, "task", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select task" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Development">Development</SelectItem>
                            <SelectItem value="Testing">Testing</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Meeting">Meeting</SelectItem>
                            <SelectItem value="Documentation">Documentation</SelectItem>
                            <SelectItem value="Research">Research</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.description}</Label>
                        <Input
                          value={task.description}
                          onChange={(e) => updateTask(task.id, "description", e.target.value)}
                          placeholder="What did you work on?"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.priority}</Label>
                        <Select value={task.priority} onValueChange={(v) => updateTask(task.id, "priority", v)}>
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
                          value={`${task.hours}h`}
                          readOnly
                          className="font-semibold tabular-nums bg-muted/40"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.startTime}</Label>
                        <Input
                          type="time"
                          value={task.startTime}
                          onChange={(e) => updateTask(task.id, "startTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.endTime}</Label>
                        <Input
                          type="time"
                          value={task.endTime}
                          onChange={(e) => updateTask(task.id, "endTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{messages.projects.timesheet.breakMinutes}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="15"
                          value={task.breakMinutes}
                          onChange={(e) => updateTask(task.id, "breakMinutes", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={addTask}>
                <icons.plus className="size-4" /> {messages.projects.timesheet.addTask}
              </Button>

              <div className="flex flex-wrap items-end gap-3 border-t border-border/60 pt-4">
                <div className="flex-1">
                  <Label>{messages.projects.timesheet.remarks}</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Any additional notes..."
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
                <Button variant="outline">
                  <icons.save className="size-4" /> {messages.projects.timesheet.saveDraft}
                </Button>
                <Button variant="gradient">
                  <icons.check className="size-4" /> {messages.projects.timesheet.submit}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history">
              {projectEntries.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {messages.projects.detail.noEntries}
                </p>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.date}</TableCell>
                        <TableCell>{entry.task}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                        <TableCell className="tabular-nums">{entry.startTime}</TableCell>
                        <TableCell className="tabular-nums">{entry.endTime}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">{entry.hours}h</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === "completed" ? "success" : entry.status === "inProgress" ? "warning" : "default"}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityVariant[entry.priority]}>
                            {entry.priority}
                          </Badge>
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
    </div>
  )
}
