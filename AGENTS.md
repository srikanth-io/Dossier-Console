# Dossier Admin — Project Standards

React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui (Radix).

## 1. UI strings live in constants only

Every user-visible string (labels, titles, placeholders, toasts, buttons, empty
states, errors) is defined in `src/constants/messages/*`. Pages/components must
**never** contain hardcoded copy.

- Shared copy: `src/constants/messages/common.ts`
- Error copy/codes: `src/constants/messages/errors.ts`
- Page copy: `src/constants/messages/{dashboard,dossiers,users,reports,settings,layout}.ts`
- Aggregate: `src/constants/messages/index.ts` (re-exported as `messages` from `src/constants/index.ts`)
- Mock/content data: `src/data/*` (content is not UI copy, but never put content in components either)

Usage:

```tsx
import { messages, commonMessages } from "@/constants"
<h1>{messages.dashboard.title}</h1>
<Button>{messages.dashboard.newDossier}</Button>
```

## 2. Async + try/catch everywhere

Service/business functions are `async`/`await` with try/catch. Error messages
come from `src/constants/messages/errors.ts` only.

- `src/lib/async.ts` — `safeAsync` (catch + handle, returns `T | null`) and
  `assertAsync` (catch + log + rethrow). Use these instead of raw try/catch.
- `src/lib/errors.ts` — `AppError` with a stable `code`.
- `src/services/apiClient.ts` — reference implementation: async/await, try/catch
  (wrapped in `assertAsync`), error copy from constants.

```ts
export async function fetchDossier(id: string): Promise<Dossier> {
  return apiClient<Dossier>(`/dossiers/${id}`)
}

const dossier = await safeAsync(() => fetchDossier(id), { context: "DossierPage" })
```

## 3. Reusable tokens and icons in constants

Everything reusable is centralized:

- `src/constants/theme/colors.ts` — semantic colors + chart palette (CSS-var backed)
- `src/constants/theme/fonts.ts` — font families, weights, sizes
- `src/constants/theme/sizes.ts` — spacing, component heights, radii, layout sizes
- `src/constants/icons.ts` — icon registry; resolve with `icons.<name>` or `resolveIcon(name)`
- `src/constants/app.ts` — app name, version, routes, API base

CSS-variable theme source of truth: `src/index.css` (`:root`, `.dark`,
`@theme inline`). Tokens in TS reference those variables; do not duplicate values.

## 4. UI: shadcn/ui only

All UI is built from shadcn/ui components in `src/components/ui/*` plus custom
components. Do not hand-roll buttons/forms/modals. Style with Tailwind utility
classes. New shadcn components are added from the registry (see README for the
CLI workaround on this machine).

## Commands

```bash
npm run dev        # start dev server (use npm.cmd in PowerShell)
npm run build      # tsc -b && vite build
npm run lint       # oxlint
```
