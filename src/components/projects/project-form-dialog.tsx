import { useEffect, useState } from "react"

import { DateField, dateKeyToDate, dateToDateKey } from "@/components/common/date-field"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { icons, messages } from "@/constants"
import type { IconName } from "@/constants/icons"
import { toast } from "sonner"
import {
  useProjects,
  type Project,
  type ProjectInput,
  type ProjectStatus,
} from "@/store/projects"
import { cn } from "@/lib/utils"

const statusOptions: ProjectStatus[] = ["planning", "active", "onHold", "completed", "cancelled"]

const colourChoices = [
  "#6366f1",
  "#8b5cf6",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
]

const iconChoices: IconName[] = [
  "dossiers",
  "activity",
  "checkCircle",
  "chart",
  "users",
  "pendingReviews",
  "sparkles",
  "shield",
]

type ProjectFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { addProject, updateProject } = useProjects()
  const editing = Boolean(project)

  const [name, setName] = useState("")
  const [client, setClient] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("planning")
  const [colour, setColour] = useState(colourChoices[0])
  const [icon, setIcon] = useState<IconName>(iconChoices[0])
  const [estimatedHours, setEstimatedHours] = useState(0)
  const [teamSize, setTeamSize] = useState(1)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    if (!open) return
    setName(project?.name ?? "")
    setClient(project?.client ?? "")
    setDescription(project?.description ?? "")
    setStatus(project?.status ?? "planning")
    setColour(project?.color ?? colourChoices[0])
    setIcon(project?.icon ?? iconChoices[0])
    setEstimatedHours(project?.estimatedHours ?? 0)
    setTeamSize(project?.teamSize ?? 1)
    setStartDate(project?.startDate ?? new Date().toISOString().slice(0, 10))
    setDueDate(project?.dueDate ?? "")
  }, [open, project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const input: ProjectInput = {
      name: name.trim(),
      client: client.trim(),
      description: description.trim(),
      status,
      color: colour,
      icon,
      estimatedHours,
      teamSize,
      startDate,
      dueDate: dueDate || null,
    }

    if (project) {
      updateProject(project.id, input)
      toast.success(messages.projects.form.updatedToast)
    } else {
      addProject(input)
      toast.success(messages.projects.form.createdToast)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editing ? messages.projects.form.editTitle : messages.projects.form.createTitle}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? messages.projects.form.editDescription
                : messages.projects.form.createDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="project-name">{messages.projects.form.name}</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={messages.projects.form.namePlaceholder}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-client">{messages.projects.form.client}</Label>
              <Input
                id="project-client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder={messages.projects.form.clientPlaceholder}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-status">{messages.projects.form.status}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger id="project-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {messages.projects.status[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="project-description">{messages.projects.form.description}</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={messages.projects.form.descriptionPlaceholder}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-estimated">{messages.projects.form.estimatedHours}</Label>
              <Input
                id="project-estimated"
                type="number"
                min="0"
                step="1"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-team">{messages.projects.form.teamSize}</Label>
              <Input
                id="project-team"
                type="number"
                min="1"
                step="1"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{messages.projects.form.startDate}</Label>
              <DateField
                value={dateKeyToDate(startDate)}
                onChange={(day) => setStartDate(day ? dateToDateKey(day) : "")}
                ariaLabel={messages.projects.form.startDate}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{messages.projects.form.dueDate}</Label>
              <DateField
                value={dateKeyToDate(dueDate)}
                onChange={(day) => setDueDate(day ? dateToDateKey(day) : "")}
                ariaLabel={messages.projects.form.dueDate}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{messages.projects.form.colour}</Label>
              <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={messages.projects.form.colour}>
                {colourChoices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    role="radio"
                    aria-checked={colour === choice}
                    onClick={() => setColour(choice)}
                    className={cn(
                      "size-7 rounded-full border-2 border-transparent transition-transform hover:scale-105",
                      colour === choice && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: choice }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{messages.projects.form.icon}</Label>
              <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={messages.projects.form.icon}>
                {iconChoices.map((choice) => {
                  const Icon = icons[choice]
                  return (
                    <button
                      key={choice}
                      type="button"
                      role="radio"
                      aria-checked={icon === choice}
                      onClick={() => setIcon(choice)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground",
                        icon === choice
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border/70"
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {messages.common.cancel}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {editing ? messages.projects.form.submitUpdate : messages.projects.form.submitCreate}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
