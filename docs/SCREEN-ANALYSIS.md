# Screen Analysis for Rebuild

Complete end-to-end breakdown of all screens targeted for rebuild.

---

## Table of Contents

1. [Projects Screens](#1-projects-screens)
2. [Document Screens (Studio)](#2-document-screens-studio)
3. [Notepad Screens](#3-notepad-screens)
4. [Timesheet Screen](#4-timesheet-screen)
5. [Resume Screens](#5-resume-screens)
6. [Shared Infrastructure](#6-shared-infrastructure)

---

## 1. Projects Screens

### Active Routes

| Route | Component | File | Lines |
|-------|-----------|------|-------|
| `/app/projects` | `ProjectList` | `src/pages/projects/ProjectList.tsx` | 300 |
| `/app/projects/:id` | `ProjectOverview` | `src/pages/projects/ProjectOverview.tsx` | 181 |
| `/app/projects/:id/documents` | `ProjectDocuments` | `src/pages/projects/ProjectDocuments.tsx` | 282 |
| `/app/projects/:id/documents/:docId` | `DocumentEditor` (lazy) | `src/pages/studio/DocumentEditor.tsx` | 1098 |
| `/app/projects/:id/timesheet` | `ProjectTimesheet` | `src/pages/projects/ProjectTimesheet.tsx` | 285 |
| `/app/projects/:id/notes` | `ProjectNotes` | `src/pages/projects/ProjectNotes.tsx` | 300 |
| `/app/projects/:id/notes/:noteId` | `NotepadEditor` (lazy) | `src/pages/NotepadEditor.tsx` | 317 |

### Dead Code (not routed)

- `src/pages/Projects.tsx` (300 lines) — duplicate of ProjectList
- `src/pages/ProjectDetail.tsx` (584 lines) — monolithic old version combining overview + timesheet + folders + delete/edit

### Store: `src/store/projects.tsx` (384 lines)

React Context + useState (not Zustand). Manages `projects` and `timeEntries` arrays. All writes go through `persistOrQueue()` for offline support.

**Key types:**

```typescript
type ProjectStatus = "active" | "completed" | "onHold" | "cancelled" | "planning"

type Project = {
  id: string
  ref: string              // Auto-generated "PRJ-NNN"
  name: string
  client: string
  description: string
  status: ProjectStatus
  color: string
  icon: string
  hoursLogged: number
  estimatedHours: number
  tasksTotal: number
  tasksCompleted: number
  teamSize: number
  startDate: string
  dueDate: string
  lastActivity: string
}

type TimeEntry = {
  id: string
  projectId: string
  date: string             // "YYYY-MM-DD"
  task: string
  description: string
  startTime: string        // "HH:MM" (24h)
  endTime: string          // "HH:MM" (24h)
  breakMinutes: number
  hours: number
  status: "completed" | "inProgress" | "blocked" | "cancelled"
  priority: "high" | "medium" | "low"
}

type ProjectInput = Omit<Project, "id" | "ref" | "hoursLogged" | "tasksTotal" | "tasksCompleted" | "lastActivity">
```

**Exposed actions:**

| Method | Description |
|--------|-------------|
| `getProject(id)` | Find project by ID |
| `getTimeEntries(projectId)` | Filter entries by project |
| `addProject(input)` | Create project with auto-generated PRJ-NNN ref |
| `updateProject(id, patch)` | Partial update |
| `deleteProject(id)` | Remove project + its time entries |
| `upsertTimeEntry(entry)` | Insert or update time entry |
| `removeTimeEntry(id)` | Delete time entry |

**Supabase tables:** `projects`, `time_entries`

### Store: `src/store/project-folders.tsx` (257 lines)

In-memory only (not persisted to Supabase). Manages folders + shares. **Only used by the dead `ProjectDetail.tsx`.**

### Components

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/projects/project-form-dialog.tsx` | 275 | Create/edit project form (name, client, status, description, hours, team, dates, color, icon) |
| `src/components/projects/project-folder-manager.tsx` | 342 | Folder browser (dead code — only used by legacy ProjectDetail) |
| `src/components/projects/folder-form-dialog.tsx` | 116 | Create/rename folder dialog (dead code) |
| `src/components/projects/folder-share-dialog.tsx` | 227 | Folder sharing management (dead code) |

### Screen Details

#### ProjectList (`src/pages/projects/ProjectList.tsx`)

**UI Structure:**
- PageHeader — title + subtitle + "New Project" button
- SearchFilterBar with inline Select for status filter
- CollectionSection > CollectionGrid — card grid, or EmptyState
- Each card: colored icon, name, client, status badge, description (2-line clamp), progress bar, hours/team metadata, due date, DropdownMenu (Edit, Delete)
- ProjectFormDialog (create/edit)
- Delete confirmation Dialog

**State:** `search`, `statusFilter`, `formOpen`, `editingProject`, `deleteTarget`

**Interactions:** New Project → opens form dialog, Search → filters by name/client, Status Select → filters, Card click → navigates to detail, Edit → opens form in edit mode, Delete → confirmation dialog

#### ProjectOverview (`src/pages/projects/ProjectOverview.tsx`)

**UI Structure:**
- PageHeader — project name + description + status badge
- 3-column stat grid: Progress (% + tasks + Progress bar), Hours (hoursLogged/estimatedHours + Progress bar), Team (teamSize)
- "Quick Access" section — 3 link cards: Documents, Notes, Timesheet (each shows count/hours)
- Date info card — start date + due date

**State:** No local state — pure read-only display

**Interactions:** Click Documents/Notes/Timesheet cards → navigate to sub-routes

#### ProjectDocuments (`src/pages/projects/ProjectDocuments.tsx`)

**UI Structure:**
- PageHeader — "{project.name} — Documents" + count + "New Document" button
- SearchFilterBar + sort select (Last updated / Created / Name)
- CollectionSection > CollectionGrid — document thumbnail cards
- Each card: DocumentThumbnail, name, relative time, DropdownMenu (Edit, Duplicate, Export PDF, Delete)
- CreateDocumentDialog (wizard for doc type/page size/orientation/template)
- ConfirmDialog for delete

**State:** `query`, `sort`, `wizardOpen`, `deleting`

**Interactions:** New Document → opens wizard, Card click → navigates to editor, Duplicate → deep clone + navigate, Export PDF → renders + downloads, Delete → confirmation

#### ProjectNotes (`src/pages/projects/ProjectNotes.tsx`)

**UI Structure:**
- PageHeader — "{project.name} — Notes" + count + "New Page" button
- SearchFilterBar + filter tab buttons (All / Pages / Folders / Favorites)
- CollectionSection > CollectionGrid — page cards
- Each card: emoji icon, title, content preview (100 chars), updatedAt, DropdownMenu (Open, Favorite/Unfavorite, Delete)
- Create Page Dialog — title input + Note/Folder toggle buttons
- Delete confirmation Dialog

**State:** `query`, `filter`, `deleteId`, `newPageTitle`, `newPageKind`, `createOpen`

**Interactions:** New Page → opens create dialog, Filter tabs → filter by type, Card click → navigates to editor, Favorite → toggles, Delete → confirmation

#### ProjectTimesheet (`src/pages/projects/ProjectTimesheet.tsx`)

**UI Structure:**
- PageHeader — "{project.name} — Timesheet"
- DateField picker + total hours display + "Save Draft" + "Submit" buttons
- Card: "Daily Entries" — grid rows with Task Type (Select), Description (Input), Priority (Select), Start Time (TimePicker), End Time (TimePicker), Break min (Input), hours display, Trash button, "Add Task" button
- Card: "Remarks" — Textarea

**State:** `selectedDate`, `remarks`, `dailyEntries`

**Interactions:** DateField → changes date, Add Task → adds entry, Edit fields → updates entries, Save Draft → upserts with status "inProgress", Submit → upserts with status "completed", Trash → removes entry

**Known Bug:** `dailyEntries` local state is populated by "Add Task" but JSX renders `dayEntries` from store — new entries never appear alongside existing ones. Remarks not persisted.

---

## 2. Document Screens (Studio)

The largest system — a custom Figma-like block editor with 20 element types.

### Active Routes

| Route | Component | File | Lines |
|-------|-----------|------|-------|
| `/app/projects/:id/documents` | `ProjectDocuments` | `src/pages/projects/ProjectDocuments.tsx` | 282 |
| `/app/projects/:id/documents/:docId` | `DocumentEditor` (lazy) | `src/pages/studio/DocumentEditor.tsx` | 1098 |

### Dead/Legacy (not routed)

- `src/pages/Dossiers.tsx` (1093 lines) — old PDF/DOCX upload manager
- `src/pages/studio/DocumentLibrary.tsx` (443 lines) — card grid library view

### Core Architecture (`src/document-engine/`)

| File | Lines | Purpose |
|------|-------|---------|
| `types.ts` | 139 | Core types: `DocElement`, `DocPage`, `DocDocument`, `DocTheme`, `DocVariable`, `VersionSnapshot`, `RenderContext`, `EditSession`, `MyComponent` |
| `registry.tsx` | 695 | 20 element type definitions with schemas, icons, defaults, categories |
| `renderers.tsx` | 1334 | 20 element renderers + inline editing + variable resolution |
| `PageContent.tsx` | 165 | Page renderer (freeform absolute positioning + flow vertical stacking) |
| `export.tsx` | 71 | PDF export via html-to-image + jsPDF |
| `history.ts` | 74 | Undo/redo hook (50-entry limit) + `uid()` generator |
| `themes.ts` | 109 | 6 theme presets (Corporate, Modern, Security, Education, Business, Minimal) + 7 font options |
| `pageSizes.ts` | 38 | A4 (794x1123), A3, A5, Letter, Legal, Custom |
| `variables.ts` | 39 | 7 system variables + `{{variable}}` resolution |
| `defaults.ts` | 113 | Default document/page factories + title page elements |
| `documentTemplates.ts` | 586 | 5 seeded template documents (VAPT, Study Notes, Resume, Invoice, Proposal) |

### 20 Block Types

| Category | Types |
|----------|-------|
| Basic | text, heading, image, shape, divider |
| Layout | container |
| Document | header, footer, pageNumber |
| Data | table, chart |
| Content | callout, list, code, link, badge |
| Security | severityBadge, finding, evidence, apiRequest, testCaseTable |

### Element Type Details

| Type | Category | Default Size | Key Props |
|------|----------|-------------|-----------|
| `text` | basic | 320x48 | content, variant, fontFamily, fontSize, fontWeight, italic, underline, color, background, align, lineHeight, letterSpacing, padding, radius |
| `heading` | basic | 420x48 | level (h1/h2/h3), content, fontFamily, fontSize, fontWeight, color, align, letterSpacing, lineHeight, textTransform |
| `image` | basic | 240x160 | src, fit, radius, borderWidth, borderColor, bg, caption |
| `shape` | basic | 160x120 | shape (rect/circle/line/arrow), fill, fillOpacity, stroke, strokeWidth, radius |
| `divider` | basic | 360x24 | orientation, thickness, style, color, widthPercent |
| `container` | layout | 360x120 | content, padding, background, borderWidth, borderColor, radius, shadow, align |
| `header` | document | 680x56 | company, title, align, showDivider, background, color, fontSize, fontWeight |
| `footer` | document | 680x40 | left, center, right, pageNumber, showDivider, background, color, fontSize |
| `pageNumber` | document | 160x28 | format, align, color, fontSize |
| `table` | data | 520x160 | rows[][], colWidths[], headerRow, headerBg, headerColor, cellBg, borderColor, borderWidth, cellPadding, align, fontSize, alternating, preset |
| `chart` | data | 360x220 | kind, title, data (line-delimited "Label N"), color, showValues |
| `callout` | content | 420x88 | variant (info/success/warning/error/tip/quote), title, content |
| `list` | content | 320x96 | kind (bullet/numbered), items, spacing |
| `code` | content | 420x160 | language, code, showLabel |
| `link` | content | 240x32 | text, href, color, underline, fontSize, weight |
| `severityBadge` | security | 140x32 | severity (critical/high/medium/low/informational), label, showLabel, size |
| `finding` | security | 560x420 | title, severity, cvss, status, affected, description, impact, evidence, recommendation, references |
| `evidence` | security | 420x160 | kind (screenshot/request/response/code/command), label, language, content |
| `apiRequest` | security | 520x320 | method, url, headers, body, showResponse, responseStatus, responseBody |
| `testCaseTable` | security | 600x220 | rows[7-col][], headerRow, fontSize |
| `badge` | content | 120x32 | text, variant (primary/secondary/accent/success/warning/error/muted) |

### Editor Screen: `DocumentEditor.tsx` (1098 lines)

Three-column IDE layout:
- **Toolbar (h-12):** Back, DocumentTitle (inline rename), save status, undo/redo/copy/paste, Insert dropdown (element types grouped by category), Variables button, Version History button, mobile palette/properties buttons, Preview button, Export PDF button, More dropdown (Add Page, Duplicate Page, Delete Page, Save as Component)
- **Page tabs (h-10):** Horizontal tab bar with context menus (Duplicate, Delete) + "+" add page
- **Left sidebar (220px):** PanelTabs (Elements / Layers) + PalettePanel or LayersPanel
- **Center:** CanvasView (zoomable, interactive page canvas)
- **Right sidebar (280px):** PropertiesPanel
- **Preview mode:** Full-page rendering of all pages with Export PDF button
- **Mobile sheets:** Sheet (left for palette/layers, right for properties)

**State:** `useDocumentHistory<DocDocument>` (undo/redo), `pageIndex`, `selectedIds`, `zoom`, `previewMode`, `panel`, mobile sheet states, `variablesOpen`, `versionsOpen`, `componentOpen`, `saveState`, `lastSavedAt`, `exporting`, `deletePageOpen`, `clipboardRef`, `saveTimerRef` (800ms debounce auto-save)

**Key interactions:**
- Element: Add, delete, duplicate, copy/cut/paste, nudge (arrow keys, shift for 10px), resize, rotate, reorder (z-index), lock/unlock, show/hide, rename, align, distribute
- Property editing: All element props via PropertiesPanel
- Inline editing: Double-click elements for text/table cell editing
- Page management: Add, duplicate, delete pages
- Document-level: Rename, theme, variables, version save/restore
- Export: PDF via `exportDocumentToPdf`
- Keyboard: Ctrl+Z, Ctrl+Shift+Z, Ctrl+C/X/V/D/A/S, Delete/Backspace, Escape, Arrow keys
- Drag-drop from palette

### CanvasView (`src/pages/studio/CanvasView.tsx`, 652 lines)

Scrollable container with zoomed page. Features:
- Selection box (dashed border)
- Resize handles (8 directions: nw, n, ne, e, se, s, sw, w) + rotation handle
- Zoom controls (bottom-right): zoom in/out, percentage, fit-to-page, grid dots toggle
- Gesture system: move (snap-to-grid), resize (min 8px), rotate (angle from center)
- All gestures use `gestureRef` (not state) for performance with `rerender()` force-update
- Inline editing: Double-click triggers `inlineEditTarget()` — table/chart cell editing or text field editing
- Drag-drop from PalettePanel via `dataTransfer` with `application/x-doc-element`

### PalettePanel (`src/pages/studio/PalettePanel.tsx`, 138 lines)

Two tabs: "Elements" (draggable element type buttons organized by category) and "Saved" (user-created component groups). Elements are draggable (`application/x-doc-element`) and clickable.

### LayersPanel (`src/pages/studio/LayersPanel.tsx`, 228 lines)

Reversed element list with: drag-reorder, selection, inline rename, show/hide toggle, lock/unlock toggle, duplicate, delete, move up/down.

### PropertiesPanel (`src/pages/studio/PropertiesPanel.tsx`, 923 lines)

Three modes:
1. **Single element selected:** Element name, schema-driven property fields, Transform section (x/y/width/height/rotation/opacity), alignment buttons, reorder/lock/hide/duplicate/delete, "Save as Component"
2. **Multi-element selected:** Count display, bulk x/y transform, align/distribute grid, save as component, bulk delete
3. **No selection (document/page settings):** Document settings (name, description, category, mode, snap-to-grid), Page settings (name, size, orientation, background), Theme section (preset, fonts, colors), Spacing section, Branding

Helper components: `ColorField`, `NumberStepper`, `SliderField`, `ImageField`, `FieldControl`

### CreateDocumentDialog (`src/pages/studio/CreateDocumentDialog.tsx`, 296 lines)

4-step wizard:
1. Document type selection (blank, resume, report, study, vapt, invoice, proposal, certificate, custom)
2. Page size selection (A4, A3, A5, Letter, Legal, Custom)
3. Orientation selection (Portrait, Landscape)
4. Start mode (Blank vs. Template) with template dropdown

### VariablesDialog (`src/pages/studio/VariablesDialog.tsx`, 130 lines)

List of name/value pairs. Each row: name Input, value Input, copy-to-clipboard (copies `{{name}}`), delete button. Add variable button.

### VersionHistoryDialog (`src/pages/studio/VersionHistoryDialog.tsx`, 115 lines)

Sheet (right side). Save version form: textarea + Save button. List of version cards: version number, timestamp, note, Restore button.

### Store: `src/store/documents.tsx` (394 lines)

React Context + useState. Manages `documents` (LibraryDocument[]) and `components` (MyComponent[]).

**Actions:**

| Method | Description |
|--------|-------------|
| `getDocument(id)` | Find by id |
| `getDocumentsByProject(projectId)` | Filter by projectId |
| `saveDocument(doc, projectId?)` | Upsert to state + Supabase |
| `updateMeta(id, patch)` | Update metadata fields |
| `duplicateDocument(id, name?)` | Deep clone with new id |
| `removeDocument(id)` | Delete from state + Supabase |
| `addVersion(id, version, note, snapshot)` | Prepend version (max 20) |
| `saveComponent(name, elements)` | Create component |
| `removeComponent(id)` | Remove component |

**Supabase tables:** `documents` (with JSONB `data` column), `document_components`

### Supporting Components

| File | Lines | Purpose |
|------|-------|---------|
| `DocumentThumbnail.tsx` | 58 | Scaled preview renderer using PageContent |
| `docx-preview.tsx` | 71 | DOCX to HTML via mammoth + DOMPurify |

---

## 3. Notepad Screens

### Active Routes

| Route | Component | File | Lines |
|-------|-----------|------|-------|
| `/app/projects/:id/notes` | `ProjectNotes` | `src/pages/projects/ProjectNotes.tsx` | 300 |
| `/app/projects/:id/notes/:noteId` | `NotepadEditor` (lazy) | `src/pages/NotepadEditor.tsx` | 317 |

### Dead Code (not routed)

- `src/pages/Notepad.tsx` (559 lines) — standalone list view with folder navigation, grid/list toggle, move functionality
- `src/pages/Pages.tsx` (232 lines) — alternate simpler list view
- `src/pages/PageDetail.tsx` (313 lines) — alternate editor with DatabaseTable toggle
- `src/components/common/page-tree.tsx` (78 lines) — sidebar tree component (never imported)
- `src/lib/folders.ts` (170 lines) — unused folder utility hook

### Store: `src/store/pages.tsx` (373 lines)

React Context + useState. Manages `pages` (PageEntry[]) and `workspaces` (localStorage only).

**Key types:**

```typescript
type PageKind = "note" | "folder"

type PageEntry = {
  id: string
  title: string
  icon: string
  content: string           // markdown-like plain text
  parentId: string | null
  children: string[]        // computed by withChildren()
  workspaceId: string
  projectId: string | null
  createdAt: string
  updatedAt: string
  favorite: boolean
  kind: PageKind
}
```

**Exposed actions:**

| Method | Description |
|--------|-------------|
| `getPagesByProject(id)` | All pages for a project |
| `getChildPages(parentId)` | Direct children of a parent |
| `getPage(id)` | Single page lookup |
| `updatePage(id, updates)` | Optimistic update + Supabase persist |
| `addPage(title, options?)` | Create page, returns it, persists |
| `deletePage(id)` | Delete + all descendants, persists |

**Workspaces:** `workspaces`, `currentWorkspace`, `setCurrentWorkspace(id)`, `createWorkspace({name, icon})`, `renameWorkspace(id, name)`, `deleteWorkspace(id)` — all localStorage only.

**Supabase table:** `notepad_pages` (columns: id, user_id, workspace_id, parent_id, title, icon, content, favorite, position, kind, project_id, created_at, updated_at)

### Content Serialization

Content is stored as **plain markdown text** in the DB, not as structured blocks. Blocks are parsed client-side:

**Parse (`parseContentToBlocks`):**
- `# ` → heading1
- `## ` → heading2
- `### ` → heading3
- `- ` → bulletedList
- `- [ ] ` / `- [x] ` → todo (unchecked/checked)
- `> ` → quote
- `---` → divider
- Other → paragraph

**Serialize (`handleSave`):** Converts blocks back to markdown text via `blocksToContent()`.

### Block Editor: `src/components/common/block-editor.tsx` (671 lines)

ContentEditable-based block editor. Each block is a `<div contentEditable>` with per-block keyboard handling.

**Supported block types:** paragraph, heading1, heading2, heading3, bulletedList, numberedList, todo, quote, callout, code, divider

**Keyboard behaviors:**
- **Enter:** Splits block (paragraph) or creates new same-type block (list/todo). Empty list/todo reverts to paragraph.
- **Backspace at start:** Non-paragraph reverts to paragraph. Paragraph merges with previous.
- **Delete at end:** Merges with next block.
- **ArrowUp/Down:** Moves focus between blocks at boundaries.
- **Space:** Detects markdown shortcuts (`#`, `##`, `###`, `-`, `>`, `[]`, `1.`, `` ``` ``) and converts block type.
- **Ctrl/Cmd+B/I/U/E:** Bold, italic, underline, strikethrough via `document.execCommand`.
- **Paste:** Strips HTML, inserts plain text only.

**Slash command menu:** When user types `/`, opens `SlashCommandMenu` popup with fuzzy search across all 24 block types from `BLOCK_TYPES`. Keyboard navigation with arrow keys + enter.

**Floating toolbar:** On text selection, shows `RichTextToolbar` at selection position with format buttons (bold, italic, underline, strikethrough, code), block type buttons (H1-H3, paragraph), alignment buttons, link insertion, and insert menu (image, bulleted list, numbered list).

### Block Types: `src/lib/blocks.ts` (189 lines)

24 block types: paragraph, heading1-3, bulletedList, numberedList, todo, toggle, quote, callout, code, divider, image, video, audio, file, bookmark, table, columnList, row, tableOfContents, breadcrumb, mathEquation, templateButton.

Each block has: `id`, `type`, `content: TextSegment[]` (text + inline styles), optional `checked`, `open`, `language`, `caption`, `url`, `children`.

### Supporting Components

| File | Lines | Purpose |
|------|-------|---------|
| `block-editor.tsx` | 671 | Rich text block editor |
| `rich-text-toolbar.tsx` | 203 | Floating selection toolbar (format, block, align, link, insert) |
| `slash-command-menu.tsx` | 184 | Slash command palette with fuzzy search |
| `giphy-picker.tsx` | 95 | GIF/icon picker (mock data) |

### NotepadEditor (`src/pages/NotepadEditor.tsx`, 317 lines)

**UI Structure:**
- Breadcrumb — Notepad root > ancestor chain > current page title
- Top toolbar: clickable icon (GiphyPicker), Input title, DropdownMenu "Move", Save status, Star/favorite toggle, Save button
- Metadata row: Created date, Updated date
- BlockEditor in min-h-[400px] container
- Sub-pages section (if any children exist)

**State:** `title`, `blocks` (parsed from page.content), `saved`, `icon`, `showGiphyPicker`

**Interactions:** Edit title → live, Edit content → live, Save → Ctrl+S or click, Toggle favorite, Move to folder, Change icon, Navigate to sub-pages

### Issues

- 4 orphaned/dead files (Notepad.tsx, Pages.tsx, PageDetail.tsx, page-tree.tsx)
- Workspace concept is localStorage-only, not in DB
- No dedicated notepad service file (all Supabase calls inline in store)
- `folders.ts` hook is dead code

---

## 4. Timesheet Screen

### Active Route

| Route | Component | File | Lines |
|-------|-----------|------|-------|
| `/app/projects/:id/timesheet` | `ProjectTimesheet` | `src/pages/projects/ProjectTimesheet.tsx` | 285 |

### Dead Code

- `src/pages/ProjectDetail.tsx` (584 lines) — has inline timesheet with History tab + mass status update

### Store

Uses `src/store/projects.tsx` (same as Projects). Key methods: `getTimeEntries(projectId)`, `upsertTimeEntry(entry)`, `removeTimeEntry(id)`.

**Supabase table:** `time_entries`

### UI Structure

```
<div className="space-y-6">
  <PageHeader title="{project.name} — Timesheet" />

  <div> (toolbar row)
    <DateField />               -- calendar date picker
    <span>Total: {totalHours}h</span>
    <Button variant="outline">Save Draft</Button>
    <Button>Submit</Button>
  </div>

  <Card> (Daily Entries)
    <CardHeader> "Daily Entries" + formatted date </CardHeader>
    <CardContent>
      if empty: "No entries for this day..." text
      else: {dayEntries.map(entry =>
        <div className="grid md:grid-cols-[1fr_1fr_1fr_auto_auto_auto_auto]">
          <Select task type />
          <Input description />
          <Select priority />
          <TimePicker start />
          <TimePicker end />
          <Input breakMinutes />
          <span>{hours}h</span>
          <Button trash />
        </div>
      )}
      <Button outline> + Add Task </Button>
    </CardContent>
  </Card>

  <Card> (Remarks)
    <Textarea />  -- "Any notes for this day..."
  </Card>
</div>
```

**State:** `selectedDate` (Date), `remarks` (string, not persisted), `dailyEntries` (TimeEntry[], local draft)

### Duration Calculation

```typescript
function recalcHours(entry: TimeEntry): TimeEntry {
  if (entry.startTime && entry.endTime) {
    const [sh, sm] = entry.startTime.split(":").map(Number)
    const [eh, em] = entry.endTime.split(":").map(Number)
    const mins = eh * 60 + em - (sh * 60 + sm) - entry.breakMinutes
    return { ...entry, hours: Math.max(0, Math.round((mins / 60) * 10) / 10) }
  }
  return entry
}
```

### Task Types (dropdown options)

```typescript
["Development", "Testing", "Design", "Meeting", "Documentation", "Research"]
```

### Shared Components

| File | Lines | Purpose |
|------|-------|---------|
| `time-picker.tsx` | 125 | 12h time picker with AM/PM toggle, grid picker (hours 1-12, minutes 00/15/30/45) |
| `date-field.tsx` | 105 | Calendar date picker with "Jump to today" button |

### Issues

- **Split-state bug:** `dailyEntries` local state populated by "Add Task" but JSX renders `dayEntries` from store — new entries never appear alongside existing ones
- **Remarks not persisted** — local state only
- **No timer/stopwatch** — purely manual entry
- **No reporting page** — only per-project hours stat
- `toDateKey()` and `recalcHours()` duplicated in both ProjectTimesheet and ProjectDetail
- No user feedback on network failure (success toast shown even when queued offline)

---

## 5. Resume Screens

### Active Routes

| Route | Component | File | Lines |
|-------|-----------|------|-------|
| `/app/resumes` | `ResumeManager` | `src/pages/resumes/ResumeManager.tsx` | 356 |
| `/app/resumes/builder` | `ResumeCreator` (lazy) | `src/pages/ResumeCreator.tsx` | 515 |
| `/app/resumes/builder/:id` | `ResumeCreator` (lazy) | `src/pages/ResumeCreator.tsx` | 515 |

### Dead Code

- `src/pages/Templates.tsx` (328 lines) — template gallery (no route in App.tsx)

### Store: `src/store/resumes.tsx` (190 lines)

React Context + useState. Manages `resumes` (Resume[]).

**Key type:**

```typescript
type Resume = {
  id: string
  name: string
  type: string        // "TEX" | "PDF" | "DOCX"
  size: string        // Human-readable, e.g. "12 KB"
  updated: string     // Relative time, e.g. "2m ago"
  source: string      // LaTeX source (empty for PDF/DOCX uploads)
  fileUrl?: string    // Data URL for uploaded files
}
```

**Actions:** `addResume()`, `updateResume(id, patch)`, `removeResume(id)`

**Supabase table:** `resume_files`

### ResumeManager (`src/pages/resumes/ResumeManager.tsx`, 356 lines)

**UI Structure:**
- PageHeader — title, description, Upload + New Resume buttons
- SearchFilterBar — search input + sort dropdown (updated/name/type)
- Drag-and-drop zone for PDF/DOCX upload with hidden `<input type="file">`
- Table — columns: Name, Type (Badge), Status (Badge: complete/draft), Updated, actions (DropdownMenu: Edit, Delete)
- EmptyState when no resumes
- Dialog — "Create Resume" with name input + template Select (from `resumeTemplates`)
- ConfirmDialog for delete

**State:** `query`, `sort`, `resumeSetupOpen`, `resumeName`, `resumeTemplateId`, `dragActive`, `deleting`, `fileInputRef`

**Interactions:**
- Upload PDF/DOCX via drag-drop or file picker → `readFileAsDataUrl` → `addResume`
- Create from template → `addResume` → navigate to builder
- Edit → navigates to builder (bug: doesn't pass resume ID)
- Delete → confirmation → `removeResume`

**Helper functions:**
- `formatBytes(bytes)` — file size formatting
- `resumeStatus(resume)` — "complete" if fileUrl set, else "draft"

### ResumeCreator (`src/pages/ResumeCreator.tsx`, 515 lines)

Fullscreen three-panel layout (no app chrome):

```
┌─────────────────────────────────────────────────┐
│ Toolbar (48px)                                  │
│ Back | Brand | Template | Filename | Export/Save │
├────────┬──────────────────┬─────────────────────┤
│ Sidebar│ Code Editor      │ Live Preview        │
│ (208px)│ (resizable)      │ (remaining space)   │
│        │                  │                     │
│ SECTIONS                  │                     │
│ - Intro   │ CodeMirror 6  │ A4 preview with     │
│ - Exp     │ LaTeX syntax  │ page numbers        │
│ - Edu     │               │                     │
│ - Skills  │               │                     │
└────────┴──────────────────┴─────────────────────┘
```

**State:** `templateId`, `fileName`, `source` (LaTeX source), `saved`, `templatesOpen`, `exporting`, `exportFailed`, `editorPct` (default 38, range 20-70), `previewPages` (computed), `scaledDims`

**URL Search Params:** `?edit=<id>` (load existing), `?template=<id>` (pre-load template), `?name=<string>` (pre-set filename)

**Interactions:**
- Edit LaTeX source → CodeEditor onChange updates `source`
- Load template → sets `templateId`, `source`, `fileName`
- Load existing resume → sets `source`, `fileName`, updates URL
- Save → `addResume` or `updateResume`, shows 2-second "Saved" flash
- Export PDF → `exportPreviewToPdf(previewHtml, baseName.pdf)`
- Download .tex → Blob + `<a>` click
- Section click → scrolls preview + focuses editor line via `editorApiRef.current.focusLine(line)`
- Resize panes → pointer event-driven, clamped 20%-70%, keyboard accessible
- Open from library dropdown → lists all resumes with `.source`

**Page Splitting Algorithm:**
1. Renders preview HTML into a hidden element at target width
2. Splits HTML at newline boundaries, measuring each candidate
3. When a block would exceed `contentHeight`, starts a new page
4. Results stored in `previewPages[]`, each rendered as separate A4 card

### LaTeX Engine: `src/lib/latexPreview.ts` (382 lines)

Custom hand-written LaTeX subset parser. No external LaTeX library.

**Exported functions:**
- `renderLatex(source)` — full document-to-HTML pipeline
- `renderInline(text)` — inline LaTeX command processing
- `getLatexSections(source)` — extracts `\section{}` titles + line numbers

**Pipeline:** `extractBody()` → `stripComments()` → `parseBlocks()` → `renderBlock()`

**Supported LaTeX constructs:**

| Construct | HTML Output |
|-----------|-------------|
| `\section{Title}` | `<h2>` with bottom border |
| `\section*{Title}` | `<h2>` with muted color, no border |
| `\begin{itemize}...\end{itemize}` | `<ul>` with `list-disc` |
| `\begin{enumerate}...\end{enumerate}` | `<ol>` with `list-decimal` |
| `\begin{center}...\end{center}` | `<div class="text-center">` |
| `\begin{multicols}{2}...\end{multicols}` | 2-column CSS grid |
| `\textbf{...}` | `<strong>` |
| `\textit{...}` / `\emph{...}` | `<em>` |
| `\texttt{...}` | `<code>` |
| `\underline{...}` | `<span class="underline">` |
| `\href{url}{text}` | `<a href="url" target="_blank">` |
| `\url{url}` | `<a>` with URL as text |
| `\hfill` | `<span class="hfill">` (16px inline-block) |
| `\hrule` | `<hr>` |
| `\\` | `<br/>` |
| `$...$` | `<code>` (inline code style) |
| `\LARGE` / `\Large` / `\large` / `\small` / `\scriptsize` | Tailwind font-size classes |
| `\vspace` / `\hspace` / `\vskip` / `\hskip` | Ignored |
| `\smallskip` / `\medskip` / `\bigskip` / `\noindent` / `\newpage` / `\clearpage` | Ignored |

### PDF Export: `src/lib/pdfExport.ts` (63 lines)

```typescript
async function exportPreviewToPdf(previewHtml: string, fileName?: string): Promise<void>
```

1. Creates hidden offscreen `<div>` at fixed 595px width
2. Injects preview HTML with `RESUME_PREVIEW_CLASSES`
3. Calls `html-to-image`'s `toPng()` at 2x pixel ratio
4. Creates `jsPDF` A4 portrait document
5. Calculates A4 page count, adds image to each page with vertical offset
6. Triggers download

**Note:** Produces visual fidelity but not selectable text (image-based PDF).

### Templates: `src/data/resumeTemplates.ts` (554 lines)

9 LaTeX templates:

| ID | Name | Character |
|----|------|-----------|
| `executive` | Executive | Srikanth Sankar (real resume) |
| `classic` | Classic | John Doe |
| `modern` | Modern | Sarah Kim (uses `\xcolor`) |
| `compact` | Compact | Alex Rivera (uses `\multicol`) |
| `minimal` | Minimal | Elena Petrova |
| `sidebar` | Sidebar | Daniel Okafor (uses `\multicol`) |
| `academic` | Academic | Dr. Priya Ramanathan |
| `technical` | Technical | Marcus Chen |
| `creative` | Creative | Amara Osei |

All templates are complete `\documentclass{article}` LaTeX documents with `\usepackage` declarations, `\begin{document}`/`\end{document}`, standard resume sections, hyperlinked contacts, and itemized bullet lists.

### Supporting Components

| File | Lines | Purpose |
|------|-------|---------|
| `code-editor.tsx` | 145 | CodeMirror 6 wrapper with `stex` syntax highlighting, custom theme, `focusLine()` API |
| `template-manager-dialog.tsx` | 95 | 2-column grid dialog showing all 9 templates with preview, "Use this template" button |

### Issues

- **Edit navigation bug:** "Edit" in ResumeManager navigates to builder without passing resume ID
- **Route param unused:** `/:id` exists but `?edit=:id` is used instead
- **`uploadResume()` in uploads.ts is unused** — files stored as DataURLs in DB, not via Storage
- **No version history** for resumes
- **PDF export is image-based** — no selectable text
- **No section-level editing** — everything is raw LaTeX text
- **Page splitting is DOM-based** — depends on browser rendering, may differ across environments

---

## 6. Shared Infrastructure

### Persistence Pattern

All stores use `persistOrQueue()` from `src/lib/mutation-queue.ts` (129 lines):

1. Optimistic UI update (state changes immediately)
2. Async Supabase write via `safeAsync`
3. If offline or network error → queues mutation in `localStorage` key `dossier-mutation-queue`
4. `flushQueue()` replays queued mutations on reconnect

### Supabase Client

`src/lib/supabase.ts` (32 lines) — lazy singleton `createClient()` from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars. Persist session + auto-refresh token.

### All Stores Use React Context (not Zustand)

Despite the `src/store/` naming, all providers are `createContext` + `useState`:

| Provider | File | Lines |
|----------|------|-------|
| `AuthProvider` | `src/store/auth.tsx` | ~222 |
| `ProjectsProvider` | `src/store/projects.tsx` | 384 |
| `ProjectFoldersProvider` | `src/store/project-folders.tsx` | 257 |
| `PagesProvider` | `src/store/pages.tsx` | 373 |
| `DocumentLibraryProvider` | `src/store/documents.tsx` | 394 |
| `ResumeLibraryProvider` | `src/store/resumes.tsx` | 190 |
| `NotificationsProvider` | `src/store/notifications.tsx` | ~232 |

### Common Components Used Across All Screens

| Component | File | Lines |
|-----------|------|-------|
| `PageHeader` | `src/components/common/page-header.tsx` | 54 |
| `EmptyState` | `src/components/common/empty-state.tsx` | 49 |
| `SearchFilterBar` | `src/components/common/search-filter-bar.tsx` | ~60 |
| `CollectionGrid` | `src/components/common/collection-grid.tsx` | ~80 |
| `CollectionSection` | `src/components/common/collection-section.tsx` | ~40 |
| `ConfirmDialog` | `src/components/common/confirm-dialog.tsx` | ~50 |
| `DateField` | `src/components/common/date-field.tsx` | 105 |
| `TimePicker` | `src/components/common/time-picker.tsx` | 125 |

### Database Tables Summary

| Table | Store | Used By |
|-------|-------|---------|
| `projects` | `projects.tsx` | ProjectList, ProjectOverview |
| `time_entries` | `projects.tsx` | ProjectTimesheet |
| `notepad_pages` | `pages.tsx` | ProjectNotes, NotepadEditor |
| `documents` | `documents.tsx` | ProjectDocuments, DocumentEditor |
| `document_components` | `documents.tsx` | DocumentEditor (Save as Component) |
| `resume_files` | `resumes.tsx` | ResumeManager, ResumeCreator |

### UI Strings

All user-facing strings are defined in `src/constants/messages/`:

| File | Covers |
|------|--------|
| `projects.ts` (176 lines) | All project + timesheet UI copy |
| `pages.ts` (54 lines) | All notepad/page UI strings |
| `dossiers.ts` (92 lines) | Dossiers/upload UI strings |
| `resume.ts` (47 lines) | Resume creator UI strings |
| `templates.ts` (33 lines) | Template gallery UI strings |
| `layout.ts` (52 lines) | Sidebar nav labels |

### Route Constants

Defined in `src/constants/app.ts` (61 lines):

```typescript
ROUTES = {
  dashboard: "/app",
  projects: "/app/projects",
  projectDetail: "/app/projects/:id",
  projectDocuments: "/app/projects/:id/documents",
  projectTimesheet: "/app/projects/:id/timesheet",
  projectNotes: "/app/projects/:id/notes",
  resumes: "/app/resumes",
  resumeBuilder: "/app/resumes/builder",
  settings: "/app/settings",
  // Legacy aliases (all resolve to /app/resumes or /app/resumes/builder):
  studio, documents, templates, dossiers, resumeCreator, notepad, notepadDetail, pages, pageDetail
}
```
