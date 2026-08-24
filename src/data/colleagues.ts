/** Mock colleague directory used for folder sharing. */
export type Colleague = {
  id: string
  name: string
  email: string
  role: string
  color: string
}

export const colleagues: Colleague[] = [
  { id: "col-1", name: "Aarav Menon", email: "aarav.menon@dossier.dev", role: "Security Analyst", color: "#6366f1" },
  { id: "col-2", name: "Priya Sharma", email: "priya.sharma@dossier.dev", role: "Compliance Lead", color: "#8b5cf6" },
  { id: "col-3", name: "Rahul Iyer", email: "rahul.iyer@dossier.dev", role: "QA Engineer", color: "#0ea5e9" },
  { id: "col-4", name: "Sneha Kapoor", email: "sneha.kapoor@dossier.dev", role: "Legal Reviewer", color: "#10b981" },
  { id: "col-5", name: "Vikram Rao", email: "vikram.rao@dossier.dev", role: "Project Manager", color: "#f59e0b" },
  { id: "col-6", name: "Ananya Nair", email: "ananya.nair@dossier.dev", role: "Auditor", color: "#f43f5e" },
]

export function getColleague(id: string): Colleague | undefined {
  return colleagues.find((c) => c.id === id)
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
