import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { errorCodes } from "@/constants/messages/errors"
import type { IconName } from "@/constants/icons"
import { AppError } from "@/lib/errors"
import { formatRelative } from "@/lib/time"
import { getSupabase } from "@/lib/supabase"
import { safeAsync } from "@/lib/async"
import { persistOrQueue } from "@/lib/mutation-queue"
import { useAuth } from "@/store/auth"

export type ProjectStatus = "active" | "completed" | "onHold" | "cancelled" | "planning"

export type Project = {
  id: string
  ref: string
  name: string
  client: string
  description: string
  status: ProjectStatus
  color: string
  icon: IconName
  hoursLogged: number
  estimatedHours: number
  tasksTotal: number
  tasksCompleted: number
  teamSize: number
  startDate: string | null
  dueDate: string | null
  lastActivity: string
}

export type TimeEntry = {
  id: string
  projectId: string
  date: string
  task: string
  description: string
  startTime: string
  endTime: string
  breakMinutes: number
  hours: number
  status: "completed" | "inProgress" | "blocked" | "cancelled"
  priority: "high" | "medium" | "low"
}

export type ProjectInput = {
  name: string
  client: string
  description: string
  status: ProjectStatus
  color: string
  icon: IconName
  estimatedHours: number
  teamSize: number
  startDate: string | null
  dueDate: string | null
}

type ProjectRow = {
  id: string
  user_id: string
  ref: string
  name: string
  client: string
  description: string
  status: ProjectStatus
  color: string
  icon: string
  hours_logged: number
  estimated_hours: number
  tasks_total: number
  tasks_completed: number
  team_size: number
  start_date: string | null
  due_date: string | null
  updated_at: string
}

type TimeEntryRow = {
  id: string
  user_id: string
  project_id: string
  entry_date: string
  task: string
  description: string
  start_time: string
  end_time: string
  break_minutes: number
  hours: number
  status: TimeEntry["status"]
  priority: TimeEntry["priority"]
}

type ProjectsValue = {
  projects: Project[]
  timeEntries: TimeEntry[]
  loading: boolean
  getProject: (id: string) => Project | undefined
  getTimeEntries: (projectId: string) => TimeEntry[]
  addProject: (input: ProjectInput) => Project
  updateProject: (id: string, patch: Partial<ProjectInput>) => void
  deleteProject: (id: string) => void
  upsertTimeEntry: (entry: TimeEntry) => void
  removeTimeEntry: (id: string) => void
}

function projectToRow(project: Project) {
  return {
    id: project.id,
    ref: project.ref,
    name: project.name,
    client: project.client,
    description: project.description,
    status: project.status,
    color: project.color,
    icon: project.icon,
    hours_logged: project.hoursLogged,
    estimated_hours: project.estimatedHours,
    tasks_total: project.tasksTotal,
    tasks_completed: project.tasksCompleted,
    team_size: project.teamSize,
    start_date: project.startDate,
    due_date: project.dueDate,
  }
}

function timeEntryToRow(entry: TimeEntry) {
  return {
    id: entry.id,
    project_id: entry.projectId,
    entry_date: entry.date,
    task: entry.task,
    description: entry.description,
    start_time: entry.startTime,
    end_time: entry.endTime,
    break_minutes: entry.breakMinutes,
    hours: entry.hours,
    status: entry.status,
    priority: entry.priority,
  }
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const ProjectsContext = createContext<ProjectsValue | null>(null)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const authenticated = status === "authenticated"

  const [projects, setProjects] = useState<Project[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(false)

  // Hours logged is always derived from the user's real time entries.
  const projectsWithHours = useMemo(
    () =>
      projects.map((p) => ({
        ...p,
        hoursLogged:
          Math.round(
            timeEntries
              .filter((e) => e.projectId === p.id)
              .reduce((sum, e) => sum + e.hours, 0) * 10
          ) / 10,
      })),
    [projects, timeEntries]
  )

  useEffect(() => {
    if (!authenticated) {
      setProjects([])
      setTimeEntries([])
      return
    }

    let cancelled = false
    setLoading(true)

    void safeAsync(async () => {
      const client = getSupabase()
      const [projectResult, entryResult] = await Promise.all([
        client.from("projects").select("*").order("updated_at", { ascending: false }),
        client.from("time_entries").select("*").order("entry_date", { ascending: false }),
      ])

      if (projectResult.error) {
        throw new AppError(errorCodes.dataLoadFailed, projectResult.error.message)
      }
      if (entryResult.error) {
        throw new AppError(errorCodes.dataLoadFailed, entryResult.error.message)
      }

      if (cancelled) return

      setProjects(
        ((projectResult.data ?? []) as ProjectRow[]).map((row) => ({
          id: row.id,
          ref: row.ref,
          name: row.name,
          client: row.client,
          description: row.description,
          status: row.status,
          color: row.color,
          icon: row.icon as IconName,
          hoursLogged: Number(row.hours_logged),
          estimatedHours: Number(row.estimated_hours),
          tasksTotal: row.tasks_total,
          tasksCompleted: row.tasks_completed,
          teamSize: row.team_size,
          startDate: row.start_date,
          dueDate: row.due_date,
          lastActivity: formatRelative(row.updated_at),
        }))
      )
      setTimeEntries(
        ((entryResult.data ?? []) as TimeEntryRow[]).map((row) => ({
          id: row.id,
          projectId: row.project_id,
          date: row.entry_date,
          task: row.task,
          description: row.description,
          startTime: row.start_time,
          endTime: row.end_time,
          breakMinutes: row.break_minutes,
          hours: Number(row.hours),
          status: row.status,
          priority: row.priority,
        }))
      )
    }, { context: "Projects.load" }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [authenticated])

  const getProject = useCallback(
    (id: string) => projectsWithHours.find((p) => p.id === id),
    [projectsWithHours]
  )

  const getTimeEntries = useCallback(
    (projectId: string) => timeEntries.filter((e) => e.projectId === projectId),
    [timeEntries]
  )

  const addProject = useCallback(
    (input: ProjectInput) => {
      const nextNumber = projects.reduce((max, p) => {
        const match = /^PRJ-(\d+)$/.exec(p.ref)
        return match ? Math.max(max, Number(match[1])) : max
      }, 0) + 1
      const project: Project = {
        id: uid(),
        ref: `PRJ-${String(nextNumber).padStart(3, "0")}`,
        hoursLogged: 0,
        tasksTotal: 0,
        tasksCompleted: 0,
        lastActivity: formatRelative(new Date().toISOString()),
        ...input,
      }
      setProjects((prev) => [project, ...prev])

      void safeAsync(async () => {
        await persistOrQueue(
          {
            kind: "upsert",
            table: "projects",
            row: projectToRow(project),
            context: "Projects.addProject",
          },
          () => getSupabase().from("projects").upsert(projectToRow(project))
        )
      }, { context: "Projects.addProject" })

      return project
    },
    [projects]
  )

  const updateProject = useCallback(
    (id: string, patch: Partial<ProjectInput>) => {
      let next: Project | undefined
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          next = { ...p, ...patch }
          return next
        })
      )
      if (next) {
        const record = next
        void safeAsync(async () => {
          await persistOrQueue(
            {
              kind: "upsert",
              table: "projects",
              row: projectToRow(record),
              context: "Projects.updateProject",
            },
            () => getSupabase().from("projects").update(projectToRow(record)).eq("id", id)
          )
        }, { context: "Projects.updateProject" })
      }
    },
    []
  )

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setTimeEntries((prev) => prev.filter((e) => e.projectId !== id))

    void safeAsync(async () => {
      await persistOrQueue(
        { kind: "delete", table: "projects", column: "id", value: id, context: "Projects.deleteProject" },
        () => getSupabase().from("projects").delete().eq("id", id)
      )
    }, { context: "Projects.deleteProject" })
  }, [])

  const upsertTimeEntry = useCallback((entry: TimeEntry) => {
    setTimeEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id)
      return exists
        ? prev.map((e) => (e.id === entry.id ? entry : e))
        : [entry, ...prev]
    })

    void safeAsync(async () => {
      await persistOrQueue(
        {
          kind: "upsert",
          table: "time_entries",
          row: timeEntryToRow(entry),
          context: "Projects.upsertTimeEntry",
        },
        () => getSupabase().from("time_entries").upsert(timeEntryToRow(entry))
      )
    }, { context: "Projects.upsertTimeEntry" })
  }, [])

  const removeTimeEntry = useCallback((id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id))

    void safeAsync(async () => {
      await persistOrQueue(
        { kind: "delete", table: "time_entries", column: "id", value: id, context: "Projects.removeTimeEntry" },
        () => getSupabase().from("time_entries").delete().eq("id", id)
      )
    }, { context: "Projects.removeTimeEntry" })
  }, [])

  const value = useMemo<ProjectsValue>(
    () => ({ projects: projectsWithHours, timeEntries, loading, getProject, getTimeEntries, addProject, updateProject, deleteProject, upsertTimeEntry, removeTimeEntry }),
    [projectsWithHours, timeEntries, loading, getProject, getTimeEntries, addProject, updateProject, deleteProject, upsertTimeEntry, removeTimeEntry]
  )

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects(): ProjectsValue {
  const context = useContext(ProjectsContext)
  if (!context) throw new Error("useProjects must be used within ProjectsProvider")
  return context
}
