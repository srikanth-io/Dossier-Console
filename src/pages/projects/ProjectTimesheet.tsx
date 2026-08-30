import { useCallback, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { DateField } from "@/components/common/date-field"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { TimePicker } from "@/components/common/time-picker"
import { icons } from "@/constants"
import { messages } from "@/constants"
import { taskTypes } from "@/data/projects"
import { toast } from "sonner"
import { useProjects, type TimeEntry } from "@/store/projects"

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

export function ProjectTimesheet() {
  const { id: projectId } = useParams<{ id: string }>()
  const { getProject, getTimeEntries, upsertTimeEntry, removeTimeEntry } = useProjects()

  const project = getProject(projectId ?? "")

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [remarks, setRemarks] = useState("")

  const dateKey = toDateKey(selectedDate)

  const dayEntries = useMemo(
    () => (projectId ? getTimeEntries(projectId).filter((e) => e.date === dateKey) : []),
    [projectId, getTimeEntries, dateKey]
  )

  const totalHours = useMemo(
    () => dayEntries.reduce((sum, e) => sum + e.hours, 0),
    [dayEntries]
  )

  const addEntry = useCallback(() => {
    if (!projectId) return
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      projectId,
      date: dateKey,
      task: taskTypes[0],
      description: "",
      startTime: "09:00",
      endTime: "17:00",
      breakMinutes: 60,
      hours: 8,
      status: "inProgress",
      priority: "medium",
    }
    upsertTimeEntry(recalcHours(newEntry))
  }, [projectId, dateKey, upsertTimeEntry])

  const updateEntry = useCallback((id: string, patch: Partial<TimeEntry>) => {
    const existing = dayEntries.find((e) => e.id === id)
    if (existing) {
      upsertTimeEntry(recalcHours({ ...existing, ...patch }))
    }
  }, [dayEntries, upsertTimeEntry])

  const removeEntry = useCallback((id: string) => {
    removeTimeEntry(id)
  }, [removeTimeEntry])

  const saveDraft = useCallback(() => {
    if (!projectId) return
    dayEntries.forEach((entry) => {
      upsertTimeEntry({ ...entry, status: "inProgress" })
    })
    toast(messages.projects.timesheet.draftSavedToast)
  }, [projectId, dayEntries, upsertTimeEntry])

  const submitDay = useCallback(() => {
    if (!projectId) return
    dayEntries.forEach((entry) => {
      upsertTimeEntry({ ...entry, status: "completed" })
    })
    toast(messages.projects.timesheet.submitToast)
  }, [projectId, dayEntries, upsertTimeEntry])

  if (!project) {
    return (
      <EmptyState
        icon={<icons.dossiers />}
        title={messages.projects.detail.notFoundTitle}
        description={messages.projects.detail.notFoundDescription}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <DateField
          value={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {messages.projects.timesheet.totalHours}:{" "}
            <span className="font-semibold tabular-nums">{totalHours.toFixed(1)}h</span>
          </span>
          <Button variant="outline" size="sm" onClick={saveDraft}>
            {messages.projects.timesheet.saveDraft}
          </Button>
          <Button size="sm" onClick={submitDay}>
            {messages.projects.timesheet.submit}
          </Button>
        </div>
      </div>

      {/* Daily Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{messages.projects.timesheet.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {dayEntries.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No entries for this day. Add your first task below.
            </div>
          ) : (
            <div className="space-y-4">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border p-4 md:grid-cols-[1fr_1fr_1fr_auto_auto_auto_auto]"
                >
                  <div>
                    <Label className="text-xs">{messages.projects.timesheet.task}</Label>
                    <Select
                      value={entry.task}
                      onValueChange={(v) => updateEntry(entry.id, { task: v })}
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">{messages.projects.timesheet.description}</Label>
                    <Input
                      value={entry.description}
                      onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                      placeholder={messages.projects.detail.descriptionPlaceholder}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">{messages.projects.timesheet.priority}</Label>
                    <Select
                      value={entry.priority}
                      onValueChange={(v) => updateEntry(entry.id, { priority: v as TimeEntry["priority"] })}
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">{messages.projects.timesheet.high}</SelectItem>
                        <SelectItem value="medium">{messages.projects.timesheet.medium}</SelectItem>
                        <SelectItem value="low">{messages.projects.timesheet.low}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">{messages.projects.timesheet.startTime}</Label>
                    <TimePicker
                      value={entry.startTime}
                      onChange={(v) => updateEntry(entry.id, { startTime: v })}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">{messages.projects.timesheet.endTime}</Label>
                    <TimePicker
                      value={entry.endTime}
                      onChange={(v) => updateEntry(entry.id, { endTime: v })}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">{messages.projects.timesheet.breakMinutes}</Label>
                    <Input
                      type="number"
                      value={entry.breakMinutes}
                      onChange={(e) =>
                        updateEntry(entry.id, { breakMinutes: Number(e.target.value) })
                      }
                      className="mt-1 w-20"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <span className="text-sm font-semibold tabular-nums">
                      {entry.hours.toFixed(1)}h
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <icons.trash className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="mt-4" onClick={addEntry}>
            <icons.plus className="size-4" /> {messages.projects.timesheet.addTask}
          </Button>
        </CardContent>
      </Card>

      {/* Remarks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{messages.projects.timesheet.remarks}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={messages.projects.detail.remarksPlaceholder}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  )
}
