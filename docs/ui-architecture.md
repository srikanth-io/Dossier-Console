# Dossier — UI Architecture & Component Reuse Context v0.1

| | |
|---|---|
| **Companion to** | PRD v0.2 |
| **Scope** | Design tokens, component layering, library usage policy, reuse contract |
| **Status** | Draft — normative for all new UI work |

---

## 1. Purpose

PRD v0.2 says *what* to build. This document says *what it is built from*, so that the same component is never written twice and so that library choices don't quietly violate the security and performance requirements in PRD §7 and §8.

The single rule this document exists to enforce:

> **A component is reusable only if it has no knowledge of where it is used.** No data fetching, no route awareness, no store access, no environment assumptions. Data in through props, events out through callbacks. Everything else is a screen's job.

---

## 2. The three surfaces

Dossier is not one UI. It is three, with different users, different risk profiles, and different performance budgets. Applying one library policy across all three is the mistake to avoid.

| Surface | Screens | Audience | Priority | Animation budget |
|---|---|---|---|---|
| **S1 — Marketing** | Splash, landing, pricing, auth entry | Prospects, first-time visitors | Impression | Generous |
| **S2 — Console** | Dashboard, engagements, findings, review queue, settings, triage | Analysts and leads, 6+ hours/day | Speed, density, clarity | Near zero |
| **S3 — Studio & Export** | Canvas editor, element renderers, preview, PDF output | Analysts producing deliverables | Fidelity, determinism | **Zero** |

**Why this split matters more here than in a normal app:** the buyer is a security team. An admin console that animates on every interaction reads as unserious to that audience, and worse, the WebGL/GSAP payloads that make S1 impressive will blow the S2 performance budget and make the S3 canvas drop frames. Motion that sells the landing page actively harms the product.

---

## 3. Library inventory and usage policy

| Library | Role | S1 | S2 | S3 | Notes |
|---|---|:--:|:--:|:--:|---|
| **Tailwind CSS** | Styling system | ✅ | ✅ | ✅ | Only tokenized classes; see §4 |
| **Radix UI** | Headless a11y primitives | ✅ | ✅ | ✅ | Foundation layer |
| **shadcn/ui** | Styled primitives (copied in) | ✅ | ✅ | ✅ | **Canonical primitive layer** |
| **lucide-react** | Icons | ✅ | ✅ | ✅ | Single icon set; no mixing |
| **class-variance-authority + tailwind-merge** | Variant API | ✅ | ✅ | ✅ | Mandatory for L2/L3 |
| **React Bits** | Animated/creative components | ✅ | ⚠️ Restricted | ❌ Banned | See §9 |
| **Framer Motion** | Animation runtime | ✅ | ⚠️ Restricted | ❌ | Layout transitions only in S2 |
| **GSAP** | Animation runtime | ✅ | ❌ | ❌ | Pulled in by some React Bits components |
| **ogl / three.js** | WebGL backgrounds | ✅ lazy | ❌ | ❌ | Route-split, never in the app shell |
| **Recharts (or equivalent)** | Charts | — | ✅ | ✅ | Must have an SSR/print-safe path |
| **CodeMirror** | Code/LaTeX editing | — | ✅ lazy | ✅ lazy | Never in the initial bundle |
| **DOMPurify** | HTML sanitization | ✅ | ✅ | ✅ | One pinned config, PRD §7.4 |
| **mammoth** | DOCX import | — | ✅ lazy | — | Hardened per PRD TM-4 |
| **jsPDF / html-to-image** | Client PDF | — | — | ⛔ Removing | Superseded by FR-6 |

Legend: ✅ allowed · ⚠️ allowed under stated conditions · ❌ banned · ⛔ being removed

### 3.1 Why React Bits gets special treatment

React Bits is a **source-copy library**, not a dependency — the CLI drops component source directly into your project rather than adding a package. That has two consequences:

1. **You own every line.** Copied components are your code, subject to your lint rules, your token system, and your security review. Treat a `jsrepo add` as a code contribution, not an install.
2. **Transitive weight is invisible.** Many components pull GSAP, `ogl`, or Framer Motion directly. `package.json` grows even though the component itself "has no dependency." A single WebGL background can add several hundred kB to a chunk.

Both point to the same policy: React Bits is a **marketing-surface library**, adapted before use.

---

## 4. Design tokens — the single source of truth

Reuse fails at the token layer first. Today the codebase has CSS variables in `src/index.css` *and* a TS token object. Two sources means drift.

### 4.1 Rule

CSS custom properties are the **only** source of truth. TypeScript tokens are generated from them, never hand-maintained in parallel. Tailwind reads the same variables.

```
tokens/tokens.css          ← authored here, only here
  ↓ generated
tokens/tokens.generated.ts ← typed accessors, committed, CI-verified in sync
  ↓ consumed
tailwind.config.ts         ← colors map to var(--…)
```

CI fails the build if `tokens.generated.ts` differs from a fresh generation.

### 4.2 Token tiers

Never reference a raw palette value in a component. Components consume semantic tokens only.

```css
/* Tier 1 — primitive palette. Never used directly in components. */
--red-600: oklch(0.55 0.21 27);
--amber-500: oklch(0.75 0.16 70);

/* Tier 2 — semantic. This is what components use. */
--color-surface: …;
--color-surface-raised: …;
--color-border: …;
--color-text: …;
--color-text-muted: …;
--color-focus-ring: …;

/* Tier 3 — domain semantic. Dossier-specific. */
--severity-critical-fg / -bg / -border;
--severity-high-fg / -bg / -border;
--severity-medium-fg / -bg / -border;
--severity-low-fg / -bg / -border;
--severity-info-fg / -bg / -border;

--status-draft / -in-review / -changes-requested / -approved;
--status-remediated / -risk-accepted / -false-positive;

--classification-internal / -confidential / -restricted;

--redaction-flagged;   /* unresolved secret detected */
--redaction-applied;   /* destructively redacted */
```

### 4.3 Severity colour rules — non-negotiable

These appear in a client deliverable, so the usual web-app leniency does not apply.

1. **Never colour-alone.** Every severity indicator carries text and a shape/icon. Roughly 8% of male readers cannot reliably distinguish your red from your amber, and CISOs skim severity tables.
2. **Contrast ≥ 4.5:1** for text on the severity background, verified in **both** light and dark themes **and** in the printed PDF. Screen-only contrast checking is insufficient — PRD §8 requires contrast checks on generated output.
3. **Print-safe variants.** Define `--severity-*-print` tokens tuned for CMYK/greyscale. A report printed in black and white must still distinguish Critical from Low.
4. **One mapping, one place.** The score → band function lives in `lib/cvss.ts` and is imported everywhere. No component computes its own band, no component accepts a band string it didn't get from that function.

---

## 5. Component layer model

Five layers. A component may only import from layers below it.

```
L4  Screen templates      EngagementLayout, ReviewLayout, StudioLayout
     ↑ may not be imported by anything
L3  Domain components     SeverityBadge, CVSSCalculator, FindingCard, EvidenceBlock…
     ↑ Dossier-specific, zero data fetching
L2  Composites            DataTable, FilterBar, EmptyState, ConfirmDialog, PageHeader
     ↑ generic app patterns
L1  Primitives            shadcn/ui — Button, Input, Dialog, Popover, Select, Tooltip
     ↑ Radix underneath
L0  Tokens                CSS variables
```

**Where the reuse win actually is:** L3. L1 is solved by shadcn. L2 is solved once and forgotten. L3 is where the same `SeverityBadge` is currently being re-implemented on the dashboard, in the findings list, in the studio element, and in the PDF renderer — four versions that will drift and produce exactly the count/label mismatches PRD §2 exists to eliminate.

---

## 6. Domain component registry (L3)

Build these once. Every screen in the PRD composes from this list.

### 6.1 Findings

| Component | Purpose | Key props |
|---|---|---|
| `SeverityBadge` | Band + score display | `score`, `band` (derived), `override?`, `size`, `showScore`, `variant: 'solid'\|'soft'\|'outline'` |
| `CVSSVectorInput` | Metric selector, all groups | `version`, `vector`, `onChange`, `readOnly` |
| `CVSSScorePanel` | Score + band + vector string, read-only display | `vector`, `version` |
| `SeverityOverrideControl` | Override band + mandatory reason | `derivedBand`, `override`, `reason`, `onChange` |
| `FindingCard` | List/summary representation | `finding`, `density: 'compact'\|'comfortable'`, `onOpen` |
| `FindingStatusPill` | Lifecycle state | `status`, `size` |
| `FindingIdTag` | Immutable display ID, monospace | `displayId` |
| `TaxonomyChipGroup` | CWE / OWASP / CVE chips | `kind`, `items`, `onRemove?` |
| `MethodologyPhaseSelect` | Phase scoped to engagement methodology | `methodology`, `value`, `onChange` |
| `AffectedAssetList` | Assets with environment badge | `assets`, `onEdit?` |
| `EnvironmentBadge` | prod / uat / dev / staging | `environment` |

### 6.2 Evidence

| Component | Purpose | Key props |
|---|---|---|
| `EvidenceBlock` | Renders any evidence kind | `evidence`, `mode: 'edit'\|'view'\|'print'` |
| `HttpExchangeView` | Request/response pane | `request`, `response`, `highlightRanges?` |
| `TerminalOutputView` | Monospace output, line numbers | `text`, `detections?` |
| `SecretDetectionHighlight` | Marks detector hits inline | `text`, `detections`, `onRedact` |
| `RedactionOverlay` | Draw-to-redact on images | `src`, `regions`, `onCommit` — **must re-encode, not overlay** |
| `EvidenceHashTag` | SHA-256 chip | `sha256`, `truncate` |

### 6.3 Workflow and governance

| Component | Purpose | Key props |
|---|---|---|
| `ClassificationBanner` | Persistent classification marker | `classification`, `clientName` |
| `ReviewGateButton` | Action button that states its own blockers | `blockers: Blocker[]`, `onAction`, `label` |
| `ApprovalTrail` | Append-only ReviewEvent timeline | `events` |
| `FindingDiffView` | Change since last review | `before`, `after` |
| `ROEBanner` | Warns when `roe_reference` is empty | `engagement` |
| `RollupSummary` | Severity counts — **query-bound only** | `engagementId` (renders from one query) |
| `RetestDeltaTable` | Resolved / open / new | `previous`, `current` |
| `TriageRow` | Imported scanner item + actions | `item`, `onPromote`, `onMerge`, `onFalsePositive` |

### 6.4 The one component with a special rule

`ReviewGateButton` is the pattern that carries the most product value, so specify it tightly:

```tsx
type Blocker = { code: string; message: string; overridable: boolean };

// Disabled buttons with no explanation are a support burden.
// This component renders WHY it is disabled, always.
<ReviewGateButton
  label="Export report"
  blockers={[
    { code: 'UNAPPROVED_FINDINGS', message: '3 findings pending approval', overridable: false },
    { code: 'UNREDACTED_EVIDENCE', message: '1 evidence item has unresolved secrets', overridable: true },
  ]}
  onAction={handleExport}
  onOverride={handleOverrideWithReason}
/>
```

Every gate in PRD FR-3 and FR-4 uses this one component. Do not hand-roll disabled buttons.

---

## 7. The component contract

A component enters `components/domain/` only if it satisfies all of these.

1. **No data access.** No fetch, no query hook, no store subscription, no `useParams`. `RollupSummary` is the sole exception and it takes only an ID and renders from a single query — that exception exists precisely to enforce PRD FR-2's single-source-of-truth rule.
2. **Variants via `cva`.** No boolean prop soup, no `className` string-concat branching.
3. **`className` passthrough merged with `tailwind-merge`.** Callers can adjust spacing without forking.
4. **`forwardRef` on anything focusable or measurable.**
5. **Tokens only.** No hex codes, no `text-[#ff0000]`, no arbitrary Tailwind values except one-off layout dimensions.
6. **Keyboard and screen-reader complete.** Radix underneath wherever an interaction pattern exists; do not reimplement a menu.
7. **Renders correctly at both densities** (`compact` for tables, `comfortable` for detail views).
8. **Light and dark verified.**
9. **`mode="print"` path exists** for anything that can appear in a deliverable — see §8.
10. **Snapshot test** covering every variant × both themes. PRD §8 requires 100% renderer snapshot coverage.
11. **Stable `data-testid`** derived from component name.
12. **No animation over 150 ms** in S2, none at all in S3.

---

## 8. The dual-renderer rule

This is the constraint most likely to be missed, and it becomes load-bearing the moment export moves server-side under PRD FR-6.

Every component that can appear in an exported document must render in two environments:

| | Screen renderer | Print renderer |
|---|---|---|
| Environment | Browser, interactive | Headless, no user, possibly Node |
| Available | Hover, focus, transitions, WebGL, `window` | None of it |
| Colour | Screen tokens | `--severity-*-print` tokens |
| Layout | Scroll, virtualization, responsive | Fixed page box, page-break rules |
| Fonts | Web fonts with fallback | Embedded, deterministic |

**Implementation:** one component, one `mode` prop, a shared props type. Not two components.

```tsx
export function EvidenceBlock({ evidence, mode = 'view' }: EvidenceBlockProps) {
  // Guard rails, enforced by lint rule in print paths:
  //   no window/document access
  //   no useEffect-driven layout
  //   no transitions or transforms
  //   no lazy/deferred content — everything renders synchronously
  const t = mode === 'print' ? printTokens : screenTokens;
  …
}
```

**Lint rule to add:** any module under `studio/elements/**` may not import from `framer-motion`, `gsap`, `ogl`, or `three`. This makes the S3 ban mechanical rather than cultural.

**Charting caveat:** most React chart libraries assume a browser and measure the DOM. Either pick one with a deterministic SSR path or pre-render charts to inline SVG server-side. A chart that silently renders empty in the PDF is a defect class you will hit late.

---

## 9. React Bits usage policy

You like the library. Keep it — on the surface where it pays for itself.

### 9.1 Allowed: S1 marketing only

Splash, landing hero, feature sections, social proof, footer, auth entry. Text-animation and background categories are a good fit here.

**Conditions:**
- WebGL and canvas backgrounds are **route-level lazy-loaded**, never in the shared app shell chunk.
- Every animated component honours `prefers-reduced-motion` and degrades to a static render. Several React Bits components do not do this out of the box — you own the source, so add it.
- No animated component sits above the fold in a way that delays LCP. Static hero text, animation layered after paint.
- Marketing routes are a separate bundle entry with their own budget (§10).

### 9.2 Restricted: S2 console

Permitted from React Bits or Framer Motion in the console: **micro-feedback only** — count-up on a dashboard stat, a 120 ms list-item enter, a toast slide.

Banned in S2: cursor effects, particle or fluid backgrounds, scroll-jacking, 3D cards, magnetic buttons, tilt, blob backgrounds, text scramble/decrypt effects, marquees.

The reasoning is not taste. An analyst opens the findings list two hundred times a day. Motion that delights on visit one is friction on visit fifty. And a "decrypt text" animation on a security tool reads as costume rather than credibility to the buyer.

### 9.3 Banned: S3 studio and export

Zero. The canvas must hold 30 fps at 200 elements (PRD §8), and print renderers have no animation frame at all.

### 9.4 Adaptation checklist

Because components are copied into your codebase, run this before committing any `jsrepo add`:

- [ ] Hardcoded colours replaced with semantic tokens
- [ ] Inline `style` attributes removed or moved to CSS variables — **inline styles fight the CSP in PRD §7.3**, which forbids `unsafe-inline`
- [ ] `prefers-reduced-motion` honoured
- [ ] Component typed; no `any` at the boundary
- [ ] Bundle delta measured and recorded in the PR
- [ ] Dependency it pulls (GSAP/ogl/three) declared in `package.json` and reviewed
- [ ] No `eval`, no `new Function`, no dynamic script injection — these break CSP and disqualify the component
- [ ] File placed in `components/marketing/`, not `components/ui/`

### 9.5 Directory quarantine

```
src/components/
  ui/            shadcn primitives — L1, all surfaces
  common/        L2 composites — all surfaces
  domain/        L3 Dossier components — S2 + S3
  marketing/     React Bits adaptations — S1 ONLY
  studio/        canvas elements — S3, dual-renderer
```

A lint rule forbids importing `components/marketing/**` from anywhere outside marketing routes. Quarantine by directory, enforced by tooling — not by a note in a wiki.

---

## 10. Performance budgets by surface

| Bundle | Budget (gzipped) | Contents |
|---|---|---|
| Shared app shell | ≤ 120 kB | React, router, tokens, L1 primitives |
| Marketing route | ≤ 200 kB additional, lazy | React Bits, GSAP, ogl |
| Console route | ≤ 130 kB additional | L2 + L3, tables, charts |
| Studio route | ≤ 250 kB additional, lazy | Canvas engine, element renderers |
| Import/export | lazy on demand | mammoth, PDF client |

Total initial JS ≤ 250 kB gzipped per PRD §8, against a v0.1 baseline of 846 kB. CI enforces per-bundle caps and fails on regression.

**Consequence worth stating plainly:** if marketing animation and console code share a chunk, the console inherits the animation payload and the budget is unreachable. The directory quarantine in §9.5 is what makes the budget achievable, not just tidy.

---

## 11. Anti-patterns — banned outright

| Banned | Why | Instead |
|---|---|---|
| Severity colour computed inside a component | Four implementations will drift | Import from `lib/cvss.ts` |
| Editable severity field | Contradicts FR-1 | Derived, read-only, override control |
| Hardcoded severity counts as props | Contradicts FR-2 | Query-bound `RollupSummary` |
| Disabled button with no reason | Support burden, user confusion | `ReviewGateButton` with blockers |
| Redaction as a black rectangle overlay | Data is still present underneath — real-world leak vector | Destructive re-encode |
| Base64 images inline in document JSON | Blows storage, breaks payload size | Object storage + reference |
| Inline `style` attributes | CSP `unsafe-inline` conflict | Classes and CSS variables |
| `dangerouslySetInnerHTML` outside the sanitizer wrapper | XSS → PRD TM-1 | One `<SafeHtml>` component, single pinned config |
| Arbitrary Tailwind colour values | Token drift, dark-mode breakage | Semantic tokens |
| Two icon libraries | Visual inconsistency, double payload | lucide only |
| Animation in `studio/**` | Frame budget, print determinism | Lint-enforced ban |
| localStorage for findings or evidence | PRD FR-11.2, TM-1, TM-2 | Server persistence |

---

## 12. Refactor sequence

Do not attempt a rewrite. Four passes, each independently shippable.

**Pass 1 — Token consolidation (½ day).** Collapse CSS vars and TS tokens into one generated source. Add Tier-3 domain tokens. Add the CI sync check. Nothing visual changes; everything downstream becomes possible.

**Pass 2 — Directory quarantine (½ day).** Create the five directories, move React Bits components into `marketing/`, add the import-boundary lint rule and the `studio/**` animation ban. Measure the bundle delta — this pass alone should show a meaningful drop in the console chunk.

**Pass 3 — Extract L3 (2–3 days).** Find every place severity is rendered and replace with one `SeverityBadge`. Same for status pills, evidence blocks, classification markings. Snapshot-test each as you go. This is where the four-way count drift dies.

**Pass 4 — Dual-renderer (3–5 days).** Add `mode` to every studio element, build the print token set, wire the print path into the FR-6 export. This is the pass that unblocks the export rewrite.

---

## 13. Definition of done for a reusable component

- [ ] Lives in the correct layer directory
- [ ] Satisfies all twelve contract items in §7
- [ ] Snapshot tests: every variant × light/dark × both densities
- [ ] `print` mode rendered and visually verified if it can appear in a deliverable
- [ ] Contrast checked in light, dark, and printed output
- [ ] Keyboard path verified; axe-core clean
- [ ] Zero new hex codes introduced
- [ ] Bundle delta recorded in the PR description
- [ ] Documented in the component catalogue with a usage example

---

## Appendix — Open UI decisions

| ID | Question | Blocks |
|---|---|---|
| UI-1 | Chart library with a deterministic print path — keep Recharts or move to a server-rendered SVG approach? | Pass 4, FR-6 |
| UI-2 | Table strategy for 1 000-finding engagements — virtualized list vs. server pagination | Console performance budget |
| UI-3 | Does the marketing site stay in the same app, or split to a separate deployment? Splitting removes the marketing payload from the product entirely | §10 budgets |
| UI-4 | Density default for the findings table — compact or comfortable | Minor; needs user input |
| UI-5 | Print typeface — must be embeddable and licensed for PDF redistribution | FR-6 |
