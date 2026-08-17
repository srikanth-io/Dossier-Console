import type { IconName } from "@/constants/icons"

export type ProjectStatus = "active" | "completed" | "onHold" | "cancelled" | "planning"

export type Project = {
  id: string
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
  startDate: string
  dueDate: string | null
  lastActivity: string
}

export const projects: Project[] = [
  {
    id: "PRJ-001",
    name: "Timesheet System",
    client: "Internal",
    description: "Build a complete timesheet management system with Excel integration and email automation.",
    status: "active",
    color: "#6366f1",
    icon: "activity",
    hoursLogged: 128,
    estimatedHours: 200,
    tasksTotal: 24,
    tasksCompleted: 16,
    teamSize: 3,
    startDate: "2026-07-01",
    dueDate: "2026-09-30",
    lastActivity: "2h ago",
  },
  {
    id: "PRJ-002",
    name: "Client Portal Redesign",
    client: "Acme Corp",
    description: "Redesign the client-facing portal with modern UI/UX and improved workflows.",
    status: "active",
    color: "#f59e0b",
    icon: "sparkles",
    hoursLogged: 86,
    estimatedHours: 160,
    tasksTotal: 18,
    tasksCompleted: 9,
    teamSize: 4,
    startDate: "2026-06-15",
    dueDate: "2026-08-31",
    lastActivity: "5h ago",
  },
  {
    id: "PRJ-003",
    name: "Security Audit Q3",
    client: "Northwind Ltd",
    description: "Quarterly security audit including penetration testing and vulnerability assessment.",
    status: "active",
    color: "#ef4444",
    icon: "shield",
    hoursLogged: 42,
    estimatedHours: 80,
    tasksTotal: 12,
    tasksCompleted: 5,
    teamSize: 2,
    startDate: "2026-08-01",
    dueDate: "2026-08-31",
    lastActivity: "1d ago",
  },
  {
    id: "PRJ-004",
    name: "API Integration",
    client: "GlobalTrade",
    description: "Integrate third-party APIs for payment processing and shipment tracking.",
    status: "completed",
    color: "#10b981",
    icon: "api",
    hoursLogged: 96,
    estimatedHours: 96,
    tasksTotal: 14,
    tasksCompleted: 14,
    teamSize: 2,
    startDate: "2026-05-01",
    dueDate: "2026-07-15",
    lastActivity: "3 weeks ago",
  },
  {
    id: "PRJ-005",
    name: "Mobile App v2",
    client: "Vertex Inc",
    description: "Second version of the mobile application with new features and performance improvements.",
    status: "onHold",
    color: "#8b5cf6",
    icon: "apple",
    hoursLogged: 32,
    estimatedHours: 240,
    tasksTotal: 30,
    tasksCompleted: 4,
    teamSize: 5,
    startDate: "2026-07-10",
    dueDate: "2026-12-31",
    lastActivity: "1 week ago",
  },
  {
    id: "PRJ-006",
    name: "Documentation Overhaul",
    client: "Internal",
    description: "Complete rewrite of technical documentation and API reference guides.",
    status: "planning",
    color: "#06b6d4",
    icon: "file",
    hoursLogged: 0,
    estimatedHours: 60,
    tasksTotal: 8,
    tasksCompleted: 0,
    teamSize: 2,
    startDate: "2026-09-01",
    dueDate: "2026-10-15",
    lastActivity: "Not started",
  },
]

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

export const timeEntries: TimeEntry[] = [
  {
    id: "TE-001",
    projectId: "PRJ-001",
    date: "2026-08-17",
    task: "Development",
    description: "Implemented project cards view",
    startTime: "09:30",
    endTime: "12:00",
    breakMinutes: 0,
    hours: 2.5,
    status: "completed",
    priority: "high",
  },
  {
    id: "TE-002",
    projectId: "PRJ-001",
    date: "2026-08-17",
    task: "Development",
    description: "Timesheet entry form",
    startTime: "13:00",
    endTime: "16:30",
    breakMinutes: 30,
    hours: 3,
    status: "inProgress",
    priority: "high",
  },
  {
    id: "TE-003",
    projectId: "PRJ-001",
    date: "2026-08-17",
    task: "Testing",
    description: "Unit tests for project module",
    startTime: "16:30",
    endTime: "18:00",
    breakMinutes: 0,
    hours: 1.5,
    status: "inProgress",
    priority: "medium",
  },
  {
    id: "TE-004",
    projectId: "PRJ-002",
    date: "2026-08-17",
    task: "Design",
    description: "Dashboard mockup review",
    startTime: "10:00",
    endTime: "12:30",
    breakMinutes: 0,
    hours: 2.5,
    status: "completed",
    priority: "high",
  },
  {
    id: "TE-005",
    projectId: "PRJ-003",
    date: "2026-08-16",
    task: "Assessment",
    description: "Vulnerability scanning",
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: 60,
    hours: 7,
    status: "completed",
    priority: "high",
  },
]
