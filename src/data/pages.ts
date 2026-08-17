export type PageEntry = {
  id: string
  title: string
  icon: string
  content: string
  parentId: string | null
  children: string[]
  workspaceId: string
  createdAt: string
  updatedAt: string
  favorite: boolean
}

export type WorkspaceEntry = {
  id: string
  name: string
  icon: string
  pageCount: number
}

export const workspaces: WorkspaceEntry[] = [
  { id: "ws-1", name: "Acme Engineering", icon: "A", pageCount: 6 },
  { id: "ws-2", name: "Personal", icon: "P", pageCount: 3 },
]

export const pages: PageEntry[] = [
  {
    id: "p-1",
    title: "Engineering",
    icon: "settings",
    content: "# Engineering\n\nThe engineering hub for all technical documentation, architecture decisions, and project tracking.",
    parentId: null,
    children: ["p-2", "p-3"],
    workspaceId: "ws-1",
    createdAt: "Aug 01, 2026",
    updatedAt: "2 min ago",
    favorite: true,
  },
  {
    id: "p-2",
    title: "Architecture",
    icon: "layers",
    content: "# Architecture\n\nSystem architecture and design decisions.\n\n## Tech Stack\n\n- React 19 + TypeScript\n- Vite 8\n- Tailwind CSS v4\n- shadcn/ui\n\n## Principles\n\n- Database is source of truth\n- Excel is working document\n- Clean separation of concerns",
    parentId: "p-1",
    children: ["p-4", "p-5"],
    workspaceId: "ws-1",
    createdAt: "Aug 02, 2026",
    updatedAt: "10 min ago",
    favorite: false,
  },
  {
    id: "p-3",
    title: "Projects",
    icon: "checklist",
    content: "# Projects\n\nActive project tracking and management.\n\n## Active Projects\n\n- Timesheet Management System\n- Document Editor\n- Resume Builder",
    parentId: "p-1",
    children: ["p-6"],
    workspaceId: "ws-1",
    createdAt: "Aug 03, 2026",
    updatedAt: "1 hour ago",
    favorite: true,
  },
  {
    id: "p-4",
    title: "Backend",
    icon: "code",
    content: "# Backend\n\nBackend architecture and API design.\n\n## Services\n\n- API Gateway\n- Auth Service\n- Database\n- Email Service",
    parentId: "p-2",
    children: [],
    workspaceId: "ws-1",
    createdAt: "Aug 05, 2026",
    updatedAt: "3 hours ago",
    favorite: false,
  },
  {
    id: "p-5",
    title: "Frontend",
    icon: "text",
    content: "# Frontend\n\nFrontend architecture and component design.\n\n## Stack\n\n- React 19\n- shadcn/ui\n- Tailwind CSS v4\n- React Router 7",
    parentId: "p-2",
    children: [],
    workspaceId: "ws-1",
    createdAt: "Aug 05, 2026",
    updatedAt: "3 hours ago",
    favorite: false,
  },
  {
    id: "p-6",
    title: "Timesheet System",
    icon: "pendingReviews",
    content: "# Timesheet Management System\n\nComplete timesheet management with project-centric workflow.\n\n## Features\n\n- Project cards with progress\n- Daily time entries\n- Calendar view\n- Excel integration\n- Monthly tracking\n\n## Status\n\nIn Progress",
    parentId: "p-3",
    children: [],
    workspaceId: "ws-1",
    createdAt: "Aug 10, 2026",
    updatedAt: "2 min ago",
    favorite: true,
  },
  {
    id: "p-7",
    title: "Quick Notes",
    icon: "pencil",
    content: "# Quick Notes\n\nRandom thoughts and ideas.\n\n- Look into command palette\n- Add keyboard shortcuts\n- Consider Notion API integration",
    parentId: null,
    children: [],
    workspaceId: "ws-2",
    createdAt: "Aug 12, 2026",
    updatedAt: "5 hours ago",
    favorite: false,
  },
  {
    id: "p-8",
    title: "Reading List",
    icon: "file",
    content: "# Reading List\n\n## Books\n\n- Designing Data-Intensive Applications\n- The Pragmatic Programmer\n\n## Articles\n\n- React Server Components\n- Tailwind CSS v4 Migration Guide",
    parentId: null,
    children: [],
    workspaceId: "ws-2",
    createdAt: "Aug 14, 2026",
    updatedAt: "Yesterday",
    favorite: false,
  },
  {
    id: "p-9",
    title: "Goals 2026",
    icon: "chart",
    content: "# Goals 2026\n\n## Q3\n\n- [ ] Ship timesheet v1\n- [ ] Launch document editor\n- [ ] Integrate Excel service\n\n## Q4\n\n- [ ] Add team management\n- [ ] Build reporting dashboard\n- [ ] Mobile app prototype",
    parentId: null,
    children: [],
    workspaceId: "ws-2",
    createdAt: "Aug 15, 2026",
    updatedAt: "2 days ago",
    favorite: true,
  },
]
