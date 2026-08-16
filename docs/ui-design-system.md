# Dossier Console — UI Design System v2

> Complete design specification for a full UI redesign of **Dossier Admin Console**.
> Applies to every page (landing → auth → dashboard → documents → templates → editor → settings)
> and to all future improvements. Use this document as the single source of truth for
> generating screens (Figma/Stitch/AI design tools) and for implementing tokens/components in code.

---

## Table of contents

1. Product & project context
2. Design direction & principles
3. Design tokens — colors
4. Design tokens — typography
5. Design tokens — spacing, radii, elevation, borders, motion, z-index
6. Iconography & data-visualization
7. Core component specifications (anatomy, sizes, states)
8. Data display & feedback components
9. Overlay & navigation components
10. Form components (incl. date picker, file upload, combobox)
11. Page-level layout specifications (every screen)
12. Dialog & flow specifications
13. Responsive & dark-mode behavior
14. Accessibility & motion rules
15. Implementation mapping to this codebase

---

## 1. Product & project context

**Product.** "Dossier" — an admin console for managing records, case files, and documents.
Users manage **documents** (created documents/resumes) and **document templates**, and compose
templates in a full visual **document studio** (canvas editor) with pages, elements, variables,
version history, and PDF export. Built for the organization **Swiftant**.

**Stack.** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + shadcn/ui (Radix) + Lucide icons.
State: local stores (localStorage) via React context; document editing via a custom
present/past/future history hook. Fonts: self-hosted Geist Variable + Geist Mono (@fontsource).

**Current limitations to fix in the redesign.**
- Flat gray-on-gray palette (`#495464`/`#bbbfca`) with no brand hue, low contrast, no elevation system.
- "Basic shadcn" look: flat buttons, default dialog/table styling, no motion or depth.
- No toast system, no date picker, no command palette, no pagination component.
- Inconsistent page headers and empty states.

**Page inventory (routes → page).**

| Route | Page | Purpose |
|---|---|---|
| `/` | Landing | Public marketing page (hero, features, CTA) |
| `/login`, `/signup` | Auth | Sign in / sign up (tabs) |
| `/app` | Dashboard | KPI cards, activity/recent table, quick links |
| `/app/documents` | Documents list | Table of created documents (search, filter, view/edit/delete) |
| `/app/dossiers/creator` | Resume creator | Two-pane resume composer + live preview |
| `/app/templates` | Template library | Card grid of document templates (create/duplicate/rename/export/delete) |
| `/app/templates/editor` | Document editor (studio) | Canvas + palette/layers/properties panels + toolbar |
| `/app/settings` | Settings | Account/preferences sections |
| `/app/dossiers/templates` | Legacy templates | Legacy resume template gallery |

**Primary user flows.**
1. Landing → sign up → dashboard → create document → editor → export PDF.
2. Templates → create template (wizard) → edit in studio → preview → save version → share.
3. Documents → search/filter → open → view/download.

---

## 2. Design direction & principles

**Direction name: "Monochrome" — refined enterprise, grayscale-first.**

A premium, professional, high-contrast admin UI. Pure grayscale typography on neutral
surfaces — no brand hue. One dark primary (**zinc-900**) for actions, layered elevation
instead of flat gray blocks, and generous-but-controlled rounding. Functional color
(red/green/amber/blue) reserved for status only, never decorative.

**Personality words:** trustworthy, precise, modern, calm, confident.

**Six principles.**
1. **Grayscale first.** Primary = near-black/near-white only. Neutrals carry the UI.
   Color never carries a single message (always + icon/text). Functional hues (red/green/amber/blue) for status only.
2. **Elevation over flatness.** Cards sit on tinted canvas with hairline borders + 2 shadow tiers.
   Hovering a card raises it one tier. Floating UI (toolbars, zoom, FABs) casts the highest tier.
3. **Ink-first type.** Foreground ink `#111827`-family on white cards. Never gray-on-gray body text.
4. **Generous whitespace, consistent rhythm.** 4px base grid; page padding 24px; section gaps 32px.
5. **Motion with meaning.** 150–300ms, transform/opacity only, ease-out entries, respect reduced-motion.
6. **Everything is a token.** No raw hex in components. Light + dark are two maps over one primitive scale.

---

## 3. Design tokens — colors

### 3.1 Primitive ramps

| Ramp | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|---|---|
| **Zinc (primary neutral)** | `#FAFAFA` | `#F4F4F5` | `#E4E4E7` | `#D4D4D8` | `#A1A1AA` | `#71717A` | `#52525B` | `#3F3F46` |
| **Zinc (darkest)** | `#27272A` | `#18181B` | `#09090B` | | | | | |

### 3.2 Semantic tokens — light

| Token | Value | Usage |
|---|---|---|
| `--background` | `#FAFAFA` | App canvas (neutral) |
| `--foreground` | `#18181B` | Primary text |
| `--card` | `#FFFFFF` | Cards, tables, panels |
| `--card-foreground` | `#18181B` | |
| `--popover` | `#FFFFFF` | Menus, pickers |
| `--popover-foreground` | `#18181B` | |
| `--primary` | `#18181B` | Buttons, links, active states |
| `--primary-foreground` | `#FAFAFA` | |
| `--primary-soft` | `#F4F4F5` | Selected rows, active-tab bg |
| `--secondary` | `#F4F4F5` | Secondary buttons bg |
| `--secondary-foreground` | `#27272A` | |
| `--muted` | `#F4F4F5` | Muted surfaces, hover fills |
| `--muted-foreground` | `#71717A` | Secondary text, placeholders |
| `--accent` | `#F4F4F5` | Hover fills on primary-adjacent items |
| `--accent-foreground` | `#18181B` | |
| `--destructive` | `#DC2626` | Destructive actions |
| `--destructive-foreground` | `#FFFFFF` | |
| `--success` | `#16A34A` | Success indicators |
| `--warning` | `#D97706` | Warnings |
| `--info` | `#2563EB` | Informational |
| `--border` | `#E4E4E7` | Hairline borders |
| `--input` | `#D4D4D8` | Input borders (slightly darker than border) |
| `--ring` | `#18181B` | Focus rings |
| `--sidebar` | `#FFFFFF` | Sidebar surface |
| `--sidebar-foreground` | `#3F3F46` | |
| `--sidebar-primary` | `#18181B` | Active nav item |
| `--sidebar-primary-foreground` | `#FAFAFA` | |
| `--sidebar-accent` | `#F4F4F5` | Nav hover |
| `--sidebar-accent-foreground` | `#18181B` | |
| `--sidebar-border` | `#E4E4E7` | |
| `--sidebar-ring` | `#18181B` | |
| `--brand-accent` | `#52525B` | Scrollbars, focus accents |
| `--brand-accent-soft` | `rgba(82,82,91,0.07)` | Subtle brand fills |
| `--scrim` | `rgba(9,9,11,0.50)` | Modal/drawer backdrop |
| `--gradient-brand` | `linear-gradient(135deg,#27272A,#3F3F46)` | Hero, logo, primary CTA glow |

### 3.3 Semantic tokens — dark

| Token | Value |
|---|---|
| `--background` | `#09090B` |
| `--foreground` | `#FAFAFA` |
| `--card` | `#18181B` |
| `--card-foreground` | `#FAFAFA` |
| `--popover` | `#1C1C1F` |
| `--popover-foreground` | `#FAFAFA` |
| `--primary` | `#FAFAFA` |
| `--primary-foreground` | `#09090B` |
| `--primary-soft` | `rgba(250,250,250,0.10)` |
| `--secondary` | `#27272A` |
| `--secondary-foreground` | `#FAFAFA` |
| `--muted` | `#27272A` |
| `--muted-foreground` | `#A1A1AA` |
| `--accent` | `#27272A` |
| `--accent-foreground` | `#FAFAFA` |
| `--destructive` | `#EF4444` |
| `--destructive-foreground` | `#FFFFFF` |
| `--success` | `#4ADE80` |
| `--warning` | `#FBBF24` |
| `--info` | `#60A5FA` |
| `--border` | `#27272A` |
| `--input` | `#3F3F46` |
| `--ring` | `#A1A1AA` |
| `--sidebar` | `#09090B` |
| `--sidebar-foreground` | `#D4D4D8` |
| `--sidebar-primary` | `#FAFAFA` |
| `--sidebar-primary-foreground` | `#09090B` |
| `--sidebar-accent` | `#27272A` |
| `--sidebar-accent-foreground` | `#FAFAFA` |
| `--sidebar-border` | `#27272A` |
| `--sidebar-ring` | `#A1A1AA` |
| `--brand-accent` | `#A1A1AA` |
| `--brand-accent-soft` | `rgba(161,161,170,0.10)` |
| `--scrim` | `rgba(0,0,0,0.65)` |

### 3.4 Chart / data-viz palette (accessibility-first)

| Role | Light | Dark |
|---|---|---|
| chart-1 (zinc-900) | `#18181B` | `#FAFAFA` |
| chart-2 (zinc-500) | `#52525B` | `#A1A1AA` |
| chart-3 (zinc-600) | `#71717A` | `#71717A` |
| chart-4 (zinc-400) | `#A1A1AA` | `#52525B` |
| chart-5 (zinc-200) | `#D4D4D8` | `#3F3F46` |
| chart-6 (zinc-100) | `#F4F4F5` | `#27272A` |

Rules: never use red/green as the only pair; add patterns/labels for series; data strokes ≥ 3:1 on bg; gridlines `border`-token at 50% opacity.

---

## 4. Design tokens — typography

**Families.**
- **Display/Headings:** `Plus Jakarta Sans` (add `@fontsource-variable/plus-jakarta-sans`) — ExtraBold 800 screen titles, Bold 700 section headers, SemiBold 600 card titles. Distinctive, premium, geometric-humanist.
- **Body/UI:** `Geist Variable` (already bundled) — Regular 400 body, Medium 500 labels/buttons.
- **Mono/Data:** `Geist Mono Variable` (already bundled) — numbers, IDs, code, table data cells (tabular figures), editors.

**Type scale (rem, 16px base).**

| Step | Size | Line-height | Tracking | Weight | Use |
|---|---|---|---|---|---|
| display-xl | 3rem / 48px | 1.1 | −0.025em | 800 | Landing hero |
| display | 2.25rem / 36px | 1.15 | −0.022em | 800 | Page titles |
| h1 | 1.875rem / 30px | 1.2 | −0.02em | 800 | Section heroes |
| h2 | 1.5rem / 24px | 1.25 | −0.019em | 700 | Card group titles |
| h3 | 1.25rem / 20px | 1.3 | −0.017em | 700 | Card titles |
| h4 | 1.125rem / 18px | 1.35 | −0.014em | 600 | Panel titles |
| body-lg | 1rem / 16px | 1.6 | 0 | 400 | Lead paragraphs |
| body | 0.9375rem / 15px | 1.6 | 0 | 400 | Default UI text |
| body-sm | 0.875rem / 14px | 1.5 | 0 | 400 | Table cells, secondary text |
| label | 0.875rem / 14px | 1.25 | 0 | 500 | Buttons, inputs, tabs |
| caption | 0.8125rem / 13px | 1.4 | 0 | 400 | Field hints, meta |
| overline | 0.75rem / 12px | 1.3 | 0.08em | 600 | UPPERCASE section labels |
| mono | 0.8125rem / 13px | 1.4 | 0 | 400 | Code, IDs, numbers |

Rules: body min 14px; never below 12px; headings track tight, body track normal; tabular-nums for numeric columns; truncate with ellipsis + tooltip, never wrap-drop.

---

## 5. Tokens — spacing, radii, elevation, borders, motion, z-index

### 5.1 Spacing (4px grid)
`0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96`.
Semantic: `space-1`=4, `space-2`=8, `space-3`=12, `space-4`=16 (default gap), `space-5`=20, `space-6`=24 (card padding), `space-8`=32 (section gap), `space-10`=40 (page section), `space-12`=48 (page top/bottom).

### 5.2 Radii
Base `--radius: 0.75rem`.
`sm` 0.5rem (chips, badges), `md` 0.625rem, `lg` 0.75rem (buttons, inputs, selects), `xl` 1rem (cards, tables, popovers), `2xl` 1.25rem (dialogs, sheets), `3xl` 1.5rem (large cards, auth card), `4xl` 2rem (hero imagery), `full` 9999px (pills, avatars, switch).

### 5.3 Elevation (shadows)
| Tier | Light | Dark |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(15,23,42,0.04)` | `0 1px 2px rgba(0,0,0,0.4)` |
| `shadow-sm` (cards resting) | `0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)` | same scaled |
| `shadow-md` (cards hover) | `0 4px 12px rgba(15,23,42,0.08)` | `0 4px 12px rgba(0,0,0,0.45)` |
| `shadow-lg` (menus, popovers) | `0 12px 28px rgba(15,23,42,0.12)` | `0 12px 28px rgba(0,0,0,0.55)` |
| `shadow-xl` (dialogs) | `0 24px 60px rgba(15,23,42,0.18)` | `0 24px 60px rgba(0,0,0,0.65)` |
| `shadow-glow` (primary CTA) | `0 8px 24px rgba(79,70,229,0.35)` | `0 8px 24px rgba(99,102,241,0.45)` |

Cards: resting `shadow-sm` + hairline `border`. Hover → `shadow-md`. Floating/overlay UI → `shadow-lg`+. No random shadows.

### 5.4 Borders
Hairline default `1px var(--border)`. Inputs use `var(--input)`. Focus: `2px` ring `var(--ring)` + `3px` offset halo `var(--ring)/25` (use `focus-visible` only). Dividers `var(--border)`.

### 5.5 Motion
- **Duration:** micro 150ms, standard 200ms, dialog 250ms, complex ≤ 400ms. Exit = 60–70% of enter.
- **Easing:** enter `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint); exit `cubic-bezier(0.4, 0, 1, 1)` (ease-in).
- **Recipes:** fade+rise 8px; scale 0.96→1 for modals; drawer slides from edge; stagger list items 30–50ms; skeleton shimmer; press `scale(0.97)`; hover `translateY(-1px)` on cards; button hover brightness/soft bg, not layout shift.
- **Always respect `prefers-reduced-motion`.**

### 5.6 Z-index scale
`0` base · `10` sticky header · `20` sticky subbars/toolbars · `30` floating toolbars, zoom · `40` drop-down menus/popovers · `50` sticky table header · `100` dialog · `110` dialog-toast · `200` toast/command palette · `1000` splash screen.

---

## 6. Iconography & data-viz

- **Icon set:** Lucide (already used), outline style, `stroke-width 2` (1.75 for dense data UIs), consistent corner rendering. One style everywhere — never mix filled/outline.
- **Sizes:** `16` (inline, buttons sm), `18` (nav), `20` (buttons md, inputs), `24` (page actions), `32` (empty-state), `48` (feature cards). Aligned to text baseline with 8px spacing.
- **Containers:** solid/soft icon tiles (`size-8/10 rounded-xl`, brand soft bg) for lists, features, KPI headers.
- **Charts:** only via the document-engine chart element + KPI sparklines; follow §3.4 palette, include legends, tooltips, empty states, keyboard focus. Never render charts with color alone.

---

## 7. Core component specifications

> Every spec: **anatomy → sizes → states → design tokens**. All components keep visible
> focus rings, hover/press feedback, and disabled (opacity 0.45 + `cursor-not-allowed`).

### 7.1 Button
- **Anatomy:** label + optional leading/trailing icon; `h-9`, px-4, radius `lg`, label type, inline-flex, gap-2. Icon-only variant: square, no label.
- **Variants:**
  - `default` — bg `primary`, text `primary-foreground`, hover shade-800, press scale(0.97), optional `shadow-glow` on primary page CTAs.
  - `secondary` — bg `secondary`, hover `accent`, text `foreground`.
  - `outline` — transparent, `border`, text `foreground`, hover `muted`.
  - `ghost` — transparent, hover `muted`.
  - `link` — text `primary`, underline on hover.
  - `destructive` — bg `destructive`, hover `#B91C1C` light / `#DC2626` dark.
  - `gradient` — `--gradient-brand`, white text, glow shadow (hero CTA, "Create").
- **Sizes:** `sm` h-8 px-3 text-sm; `md` h-9 px-4 text-sm (default); `lg` h-11 px-6 text-base; `icon` 36×36; `icon-sm` 28×28.
- **Loading:** swap label for `size-4` spinner + keep width (no layout shift).
- **Group:** segmented button groups share 2px gap, no double borders.

### 7.2 Input (text, search, password, number)
- **Anatomy:** label above (or floating) · field `h-9`/`h-10` · left icon optional · clear (×) button · helper text below · error state below.
- **Design:** bg `card`, border `input` 1px, radius `lg`, px-3, focus: ring 2px `ring` + halo; placeholder `muted-foreground/60`; disabled opacity 0.45; read-only bg `muted`.
- **States:** default → hover (border darkens to `foreground/25`) → focus → filled → error (border+ring `destructive`, icon `alert-circle`, message `caption` in `destructive`) → success (optional `check-circle` `success`).
- **Password:** trailing show/hide eye toggle (icon-only, `ghost`).
- **Search:** leading `search` icon, `rounded-full` in topbars, radius `lg` in filters; keyboard hint (`⌘K`/`/`) chip on right.
- **Label/helper/error pattern (FormField):** label `label` weight 500 + required `*` in `destructive`; helper `caption` `muted-foreground`; error `caption` `destructive`, placed below field; focus first invalid field on submit; `aria-live="polite"` for errors.

### 7.3 Textarea
Same as input; min 3 rows; corner drag-resize handle; `resize-none` for canvas editors; char counter bottom-right `caption`.

### 7.4 Select (native) + Combobox (searchable)
- **Select:** styled like input + chevron; popover list `popover` `shadow-lg` radius `lg`, option height h-9 px-3, selected = `primary-soft` + check icon, hover `accent`, dividers optional.
- **Combobox/Autocomplete:** input + command menu; groups, checkmarks, empty "No results", `⌘K`-style search; used in template source picker, category filters, variable insertion.

### 7.5 Checkbox / Radio / Switch
- **Checkbox:** 18×18, radius `sm`, border `input`; checked = bg `primary`, white check; indeterminate = dash; label right with `label` text; 8px gap.
- **Radio:** 18×18 circle, checked = `primary` ring + dot; group vertical 8px or horizontal 24px gap.
- **Switch:** 44×24 track, radius `full`, thumb 20 white; on = `primary`, off = `input`; focus ring; used in settings + editor options (snap-to-grid, show values).

### 7.6 Toggle / Segmented control
- Contained group: container `muted` radius `lg` p-1; active segment `card` `shadow-sm` radius `md`; used for editor mode (Edit/Preview), sorting, page zoom density. Equal widths.

### 7.7 Tabs
- **Underline tabs** (settings, editor panels): 36px tall, `label` weight 500, active = `foreground` + 2px `primary` underline, inactive `muted-foreground`, hover `foreground/80`; 24px gaps.
- **Pill tabs** (auth, filter bars): radius `full`, active = `primary-soft` text `primary` (or `primary` bg white text on hero/dark).

### 7.8 Card
- **Anatomy:** optional header (title `h3` 600 + description `body-sm` `muted-foreground` + right actions), content (padding `space-6`), optional footer (right-aligned actions, `border-t`).
- **Styles:** `default` — `card` bg, hairline border, `shadow-sm`, hover `shadow-md` + `translateY(-1px)` when interactive. `gradient` — subtle `--gradient-brand` top-edge accent (2px). `plain` — no border (grouping on canvas).
- **Interactive card:** full-card click, chevron affordance, focus ring, pressed `scale(0.99)`.

### 7.9 Table (data table)
- **Frame:** `card` bg, border, radius `xl`, overflow-hidden.
- **Header row:** h-11, `caption` weight 600 `muted-foreground` UPPERCASE optional; sticky under filters (`z-50`); sortable headers show arrow on active sort.
- **Body rows:** h-12 (density: `sm` 40px, `md` 48px, `lg` 56px); hover `muted`; selected row `primary-soft` + 2px left `primary` indicator; zebra optional `muted/40`; row divider hairline.
- **Cells:** `body-sm`; numeric right-aligned + `tabular-nums` + `mono`; primary text `font-medium`; secondary line under (name + id) uses `caption` `muted-foreground`.
- **Row actions:** trailing icon cluster or `moreVertical` dropdown; destructive separated by divider, `destructive` text.
- **Empty state:** centered 56px icon tile + title + description + primary/secondary action (see §8.6).
- **Toolbar (above frame):** search input, filters (select/segmented), density toggle, column toggle (optional), bulk-action bar appears when rows selected (slide-down, primary tint).
- **Pagination:** bottom-right, `Page 1 of N` + prev/next + page-size select (see §8.5).

### 7.10 Badge / Status pill
- Pill radius `full`, px-2.5, h-6, `caption` weight 600, leading status dot (6px).
- **Variants:** `default` (muted), `secondary`, `outline`, `destructive`, `success` (emerald-50/`#16A34A` text, dark: emerald-500/20 + `#34D399`), `warning` (amber), `info` (sky), `brand` (`primary-soft` + `primary`). Status always includes dot + text (never color alone).

### 7.11 Avatar + Avatar group
- 8–64px, radius depends on variant (`rounded-full` for person, `rounded-xl` for document/file). Fallback = initials on `brand` soft bg with `brand` text. Online dot bottom-right (8px ring `card`). Group: overlap −8px with ring `card`.

### 7.12 Skeleton (loading)
- Resting: `muted` base. Shimmer: 1000ms left-to-right gradient overlay (`muted` → `muted-foreground/8%`), loop. Shapes: text rows (h-3–4, w%), circle avatar, card frame (h-24). Replace spinners for content > 300ms.

### 7.13 Progress
- Track h-2 `muted` radius full; fill `primary` (success → `success`); indeterminate = 1s sweep; step dots for wizard (filled = `primary`, current = ring, future = `muted`). Label right `caption`.

---

## 8. Data display & feedback components

### 8.1 Stat / KPI card
- **Anatomy:** icon tile (size-10 rounded-xl, soft color) · label `caption` `muted-foreground` · value `h2` 700 `tabular-nums` · delta pill (`+12%` up=success/arrow-up, down=destructive/arrow-down) · optional mini sparkline right.
- **Grid:** 2/3/4-up, `gap-4`, equal heights, card style. Value change animates (count-up 300ms).

### 8.2 Empty state
- Centered column: 56px soft icon tile (brand or contextual color) → title `h3` → description `body-sm` `muted-foreground` (max-w-sm) → primary + secondary buttons. Vertical spacing 16/8/24. Contextual illustration variant for landing/hero only.

### 8.3 Toast (new — add sonner or shadcn toast)
- Top-right stack, width 360px, `card` bg `shadow-xl` border, radius `lg`, icon per tone (success/error/info/warning), title `body-sm` 600 + optional description `caption`, close ×, auto-dismiss 4s (errors persist until dismissed), action button (e.g. Undo). Enter: fade+slide from right 200ms; exit faster. `aria-live="polite"`.

### 8.4 Tooltip
- 1-line text, `popover` bg, 12px, radius `sm`, `shadow-lg`, arrow, appears 150ms after hover (no flash), keyboard-accessible via focus. Delay open 500ms on desktop hover.

### 8.5 Pagination
- Prev/Next icon buttons + page number buttons (active = `primary` white; sibling hover `muted`) + ellipsis for overflow + optional per-page select (10/25/50). Compact variant: "Showing 1–10 of 240".

### 8.6 Loading screens
- Route-level: centered logo mark pulse (as existing splash, refined). Block-level: skeleton (§7.12). Button-level: spinner in button.

---

## 9. Overlay & navigation components

### 9.1 Dialog / Modal
- **Anatomy:** scrim (`--scrim`, backdrop-blur 4px) · surface `card` `shadow-xl` radius `2xl` (mobile: full-width bottom-sheet radius top `2xl`) · header (title `h3` 600 + description `body-sm` `muted-foreground`, leading icon tile optional, close × top-right `ghost` icon) · body (p-6, gap-4) · footer (border-t, p-4, right-aligned, destructive separated left of primary, cancel=`outline`).
- **Motion:** fade scrim + surface scale 0.96→1 rise 8px, 250ms enter / 160ms exit. Escape + scrim click dismiss; focus first field; restore focus on close.
- **Sizes:** `sm` 400, `md` 500 (default), `lg` 640, `xl` 800, `full` (editor flows, preview).

### 9.2 Alert dialog (confirm)
- No close X. Icon tile (destructive/alert) · title · description · destructive + cancel. Enter: no focus steal beyond buttons.

### 9.3 Dropdown menu
- Trigger (button/icon) → popover `card` `shadow-lg` radius `lg` min-w 200 p-1 · item h-8 px-2 radius `md` label `body-sm` (leading icon 16, destructive variant red) · separator `border` · label header `caption` `muted-foreground` uppercase · selected checkmark right. Items: hover `accent`, destructive hover `red-50` light / red-500/10 dark.

### 9.4 Popover
- Anchor UI (date picker, color swatches, insert menus): `card` `shadow-lg` radius `lg`, arrow, position-aware flip. 200ms enter.

### 9.5 Sheet / Drawer (right)
- From right, 380px (edit rail, variables, layers-on-mobile). Scrim + slide-in 250ms, exit 160ms. Header + scroll body + pinned footer.

### 9.6 Command palette (new — add shadcn command)
- Centered overlay, scrim blur; input row (search icon + hint `esc`) · grouped results (heading `overline`; item icon + label + right shortcut) · keyboard: ↑↓ enter esc; empty state. Radius `xl` `shadow-xl`.

### 9.7 Breadcrumb
- `caption`; items `muted-foreground` hover `foreground`; separator chevron 16 muted; current item `foreground` weight 500. Used in studio (Library → Template name → Page 2).

### 9.8 Accordion
- Item: h-11 row, title `body-sm` 500 + chevron rotate 180°; content padded, divider between. Animate height 200ms.

### 9.9 Sidebar (app shell)
- Width 256px (collapsible to 72px icon-rail), `sidebar` surface, hairline right border, full height sticky.
  - **Brand block** (64px): gradient logo tile 32px + "Dossier" (600) + "Admin Console" `caption` muted.
  - **Nav sections:** `overline` labels; items h-9 radius `lg`, icon 18 + label `body-sm`; active = `sidebar-primary` bg white text + glow (or `primary-soft` + left 2px bar in light); hover `sidebar-accent`; badges right.
  - **Bottom:** upgrade/help card optional, user card (avatar + name/email + chevron menu: settings, sign out destructive).
  - Collapse: icon-rail 72px, tooltips, no labels.
- **Nav items:** Dashboard · Documents · Templates · Settings (via user menu). Group: Overview (Dashboard) / Workspace (Documents, Templates).

### 9.10 Topbar (app shell)
- Height 56px, `card`/`background` blur, hairline bottom border, px-6.
- Left: global **search** (⌘K opens palette). Right: notifications bell (unread dot), theme toggle (sun/moon), help (?) icon, avatar menu. Contextual mode: page title (h1) left in content pages instead of search (studio).

---

## 10. Form components (incl. date picker, upload, stepper)

### 10.1 Date picker (new — add shadcn calendar + popover)
- **Trigger:** input-like field `h-9` with calendar icon + value (`17 Aug 2026`), clear ×.
- **Panel:** popover 320px; month grid; header nav ‹ month-name-year › (icon buttons); weekday header `caption` muted; day cells 36×36 radius `lg`: hover `muted`, selected `primary` white, today = `primary` ring, range = `primary-soft` ends `primary`; month dropdown both. Footer: Today / Clear.
- **Inline vs range:** single + range (start/end with separator "→"). Locale-aware formatting; keyboard: ↑↓←→, Enter select, Esc close.

### 10.2 File upload / import dropzone
- Dashed 1.5px `input` border, radius `lg`, p-8; center: upload icon tile + "Drag & drop or browse" + accepted types `caption`; hover/drag-over = `primary` border + `primary-soft` bg; selected file chip (name, size, remove ×); progress bar during import; error message + retry. (Used in: template import, document upload.)

### 10.3 Stepper / wizard progress
- Horizontal steps: circle 32px (number/check) + label below (`caption`); done = `primary` bg white check; current = `primary` ring + `primary-soft`; todo = `muted`; connector 2px line `border`, active stretch `primary`. Used in Create Template wizard.

### 10.4 Color picker
- Swatch grid (24×24 radius `md`, ring on selected + check) + hex input + eyedropper optional. Native `color` input styled behind swatch for the editor element color.

### 10.5 Slider / fields controls
- Track h-1.5 `muted`, thumb 20 white `shadow-sm` `ring` border, active fill `primary`; value bubble on drag. Used for editor: opacity, line-height, page zoom.

### 10.6 Editor-specific controls (studio)
- **Palette items:** 48–56px grid tiles, icon + label `caption`, hover lift, drag handle.
- **Properties panel:** grouped sections (`overline` headers), label+control rows, numeric steppers (h-8, − value +), inline chip inputs, style swatches.
- **Layers panel:** rows h-9 with visibility (eye) + lock + rename + drag reorder; selected = `primary-soft` left bar.
- **Canvas overlay:** element selected = 2px `primary`/`ring` dashed+handles (8px squares `card` `shadow`); editing chip (e.g. "Editing Heading") top-left `primary` white; floating zoom toolbar bottom-right (pill `card` shadow: − % + Fit); double-click = inline edit.

---

## 11. Page-level layout specifications

### 11.1 App shell (all `/app` pages)
```
┌─────────┬────────────────────────────────────────────┐
│ Sidebar │ Topbar (search/actions/avatar)  56px       │
│ 256/72  ├────────────────────────────────────────────┤
│         │ Content  max-w-[1400px]  px-6 py-6         │
│         │  · Page header (h1 + subtitle + actions)   │
│         │  · Page content                            │
└─────────┴────────────────────────────────────────────┘
```
Page header pattern: `h1` display 800 + subtitle `body-sm` muted; right-aligned action cluster (secondary first, primary last). Section gaps 32px; card grids `gap-4`.

### 11.2 Landing (`/`)
- **Top nav:** sticky blur, logo, links (Features, Templates, Pricing, Docs), Sign in (ghost) + Get Started (gradient).
- **Hero:** centered, badge pill ("New — AI document studio"), `display-xl` 800 with bold foreground word, lead `body-lg` max-w-2xl, dual CTA (gradient + outline), product screenshot in `2xl` radius frame `shadow-xl`.
- **Logo strip:** 6 muted grayscale logos.
- **Features:** bento grid — one large card (2-col) + 4 small, icon tiles + `h3` + `body-sm`.
- **How it works:** 3 steps with numbers/connectors.
- **CTA band:** `--gradient-brand` dark-neutral panel, white heading, gradient-on-gradient contrast (white button), rounded `3xl`.
- **Footer:** 4 columns, muted, hairline top.

### 11.3 Auth (`/login`, `/signup`)
- Split layout: left brand panel (hidden ≤ 1024px) — gradient neutral, white logo + tagline + testimonial; right form panel (max-w-md centered): logo (mobile), pill tabs Sign in/Sign up, title + subtitle, form fields (email, password + toggle, name on signup), remember me + forgot link row, primary submit (full-width, loading state), divider "or", social buttons (outline), footer line.
- Card container: `card` border `shadow-lg` radius `3xl` p-8 (or transparent panel on tinted bg).
- Errors: inline per-field + summary alert.

### 11.4 Dashboard (`/app`)
- Header + "Create" primary.
- **KPI row:** 4 stat cards (§8.1): Total documents, Templates, Pending reviews, Active users.
- **Charts row:** two cards (Bar "Documents per week" with legend, Donut "Document types").
- **Recent documents:** table card with "View all" header action.
- **Quick actions:** 3-4 gradient icon tiles linking to flows.

### 11.5 Documents list (`/app/documents`)
- Header + actions (New document, Import).
- **Filter toolbar:** search (300px), status select, type select, sort select, view toggle (table/grid), density.
- **Table** (§7.9) columns: Name(+id), Type, Owner, Updated, Status pill, Size, Actions. Row selection + bulk bar (Delete, Export, Move). Pagination.

### 11.6 Template library (`/app/templates`)
- Header + "Create template" gradient CTA + Import + tabs (All / categories).
- **Grid:** responsive cards (min 280px): thumbnail (aspect 3/4, `2xl` radius, hover overlay with quick actions — Edit / Preview / ⋯), body: name `h4` 600 + meta `caption` (pages · updated) + category badge; footer actions (Edit primary-sm, Duplicate, More). Card hover `shadow-md` lift.
- Empty state + legacy-resume hint banner (info tone).

### 11.7 Document studio (`/app/templates/editor`)
- Full-height editor: **toolbar** 48px (back, renameable title + save status, undo/redo, copy/paste, insert menu, variables, version history, preview toggle, Export, More). **Body:** left palette panel (220px, tabs Palette/Layers), center canvas (scroll, `background` tint, page `card` `shadow-xl` white A4), right properties panel (280px, grouped). Floating zoom pill bottom-right. Inline editing chips. Dialog layers: insert library, variables, version history, component save.
- Canvas page: white, `shadow-xl`, radius `sm`; selection handles; grid dots toggle.

### 11.8 Settings (`/app/settings`)
- Two-column: left nav (Account, Appearance, Notifications, Security, Billing, Danger zone — 220px) + right content max-w-2xl: section cards (`h2` + description + form groups `grid gap-4`, save footer). Appearance: theme radio cards (Light/Dark/System previews), radius slider. Danger zone: red-bordered card with destructive buttons.

### 11.9 Resume creator (`/app/dossiers/creator`)
- Two-pane: left editor (fields grouped in cards) + right sticky preview (page `card` `shadow-xl`), 50/50 split with drag divider; top bar (back, template select, Export PDF/DOCX). Studio-styled controls reused.

---

## 12. Dialog & flow specifications

| Flow | Type | Size | Notes |
|---|---|---|---|
| Create template | Wizard dialog | `lg` | Stepper: type → page/orientation → start point; content options as radio cards; footer Back/Next, final Create-and-open |
| Import document | Dialog | `md` | Dropzone + progress + error retry |
| Rename template/document | Dialog | `sm` | Label + input + Save/Cancel; Enter commits |
| Delete template | Alert dialog | `sm` | Destructive tile + warning description |
| Preview | Dialog | `xl` | Scrollable page preview + Export + Close |
| Version history | Sheet (right) | 400px | Version list (note, date, restore), "Save version" composer at top |
| Variables | Dialog | `md` | List rows (name/value/insert/remove) + add row |
| Save as component | Dialog | `sm` | Name input + hint |
| Sign out | Alert dialog | `sm` | Confirm |
| Duplicate | Dialog | `sm` | Auto-name confirm |

All flows: scrim blur, 2xl radius, motion per §9.1, focus management, Esc + scrim dismiss, destructive visually separated.

---

## 13. Responsive & dark-mode behavior

**Breakpoints:** 375 / 640 (sm) / 768 (md) / 1024 (lg) / 1440 (xl). Desktop-first (admin), but: sidebar collapses to icon-rail ≤ 1280, to overlay drawer ≤ 1024; tables become horizontal-scroll frames with sticky first column ≤ 768 or card-list on ≤ 640; studio 3-panel → stacked (palette as left sheet, properties as right sheet); dialogs become bottom-sheets on mobile; auth split → single panel; landing single column.

**Dark mode:** full dual-theme from the same primitives (§3.3). Tested independently for contrast (body ≥ 4.5:1, secondary ≥ 3:1). Dark = desaturated tints, not inverted light. `prefers-color-scheme` + manual toggle persisted (class `.dark` on html — already the app's pattern).

---

## 14. Accessibility & motion rules

- Focus visible everywhere (2px ring + halo), only on `:focus-visible`.
- Contrast: body text ≥ 4.5:1; large text ≥ 3:1; borders/placeholders ≥ 3:1 vs surface.
- Touch targets ≥ 36px desktop / 44px touch.
- Forms: visible labels, per-field errors, autocomplete attributes, focus first error.
- All icons `aria-hidden` unless meaningful; icon-only buttons need `aria-label`.
- Tables: semantic `th scope`, `aria-sort` on sortable columns, sortable by keyboard.
- Dialog: focus trap + restore; alert dialogs confirm before destructive.
- Motion: 150–300ms micro, transform/opacity only, no width/height animation, reduce on `prefers-reduced-motion`.
- Copy: no placeholder-only labels; every empty state has an action.

---

## 15. Implementation mapping to this codebase

### 15.1 Tokens (src/index.css)
Replace `:root` and `.dark` blocks with the semantic values in §3.2/§3.3; add missing vars: `--primary-soft`, `--success`, `--warning`, `--info`, `--destructive-foreground`, `--scrim`, `--gradient-brand` (as color, not gradient) + shadow/radius tokens via `@theme inline`. Keep existing Tailwind mapping names (primary, card, sidebar, brand-accent…) so `bg-card`, `text-muted-foreground` etc. keep working.

### 15.2 Constants
- `src/constants/theme/colors.ts` — add `primarySoft`, `success`, `warning`, `info`, `scrim` keys (CSS-var backed).
- `src/constants/theme/fonts.ts` — add heading/display family + `tabular-nums` guidance.
- `src/constants/theme/sizes.ts` — align componentHeights (sm 32 / md 36 / lg 40 / xl 48), radii, shadows.
- `src/constants/icons.ts` — keep Lucide registry; add any missing keys (sun, moon, calendar, plus the ones needed for new components).

### 15.3 Components to add (shadcn registry)
`calendar` + `popover` (date picker), `command` (palette), `sonner` or toast, `alert-dialog`, `accordion`, `pagination`, `radio-group`, `slider`, `collapsible`, `scroll-area`. Components already present and restyled: button, input, textarea, select, checkbox, switch, tabs, table, card, badge, avatar, dialog, dropdown-menu, tooltip, skeleton, progress, separator, sheet, breadcrumb, label, popover(→add), sheet.

### 15.4 Global patterns
- Page header component (`PageHeader`) reused across Documents, Templates, Dashboard, Settings.
- `StatCard`, `EmptyState`, `StatusPill`, `DataTable` (toolbar+table+pagination), `FormField`, `ConfirmDialog` — shared in `src/components/`.
- Editor-specific styling isolated in the studio components (CanvasView, PalettePanel, PropertiesPanel, LayersPanel).

### 15.5 Rollout order
1. Tokens (index.css + constants) → instant global restyle.
2. Core controls (button, input, select, form, card, badge).
3. Data layer (table, pagination, empty states, toasts, skeletons).
4. Overlays (dialogs, alert dialog, dropdowns, sheets, command palette, date picker).
5. Shell (sidebar, topbar, page headers).
6. Per-page layouts (landing, auth, dashboard, documents, templates, studio, settings).
7. Dark mode + responsive + motion pass.

---

*End of specification. Reuse these tokens, components, and page recipes for every future screen.*
