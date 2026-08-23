export type {
  Project,
  ProjectInput,
  ProjectStatus,
  TimeEntry,
} from "@/store/projects"

export const taskTypes = [
  "Development",
  "Testing",
  "Design",
  "Meeting",
  "Documentation",
  "Research",
] as const
