# Dossier Admin

Admin console for managing dossiers, built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

## Tech Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) — dev server and build tool
- [Tailwind CSS v4](https://tailwindcss.com) — utility-first styling
- [shadcn/ui](https://ui.shadcn.com) — Radix UI + Tailwind components
- [React Router](https://reactrouter.com) — client-side routing
- [lucide-react](https://lucide.dev) — icons

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the Vite dev server            |
| `npm run build`    | Typecheck and build for production   |
| `npm run preview`  | Preview the production build         |
| `npm run lint`     | Run Oxlint                           |

## Project Structure

```
src/
  components/        App components (sidebar, splash screen)
    ui/              shadcn/ui components
  constants/         UI copy, error messages, theme tokens, icon registry
    messages/        Page + shared copy (landing, login, dashboard, ...)
    theme/           Colors, fonts, sizes, radii
  data/              Mock/content data
  layouts/           Layouts (AppLayout)
  lib/               Utilities (cn, async helpers, errors)
  pages/             Route pages (Landing, Login, Dashboard, Dossiers, ...)
```

## Routes

| Path             | Page              |
| ---------------- | ----------------- |
| `/`              | Landing           |
| `/login`         | Sign in           |
| `/signup`        | Sign up           |
| `/app`           | Dashboard         |
| `/app/dossiers`  | Dossiers          |
| `/app/users`     | Users             |
| `/app/reports`   | Reports           |
| `/app/settings`  | Settings          |

A splash-screen animation plays on initial app load before the landing page.

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component>
```

> Note: on this machine the shadcn CLI misresolves the `@` alias when the project
> lives under a `Documents` folder with Windows-protected sibling folders. If the
> CLI writes into a literal `@/` directory, move the generated files into
> `src/components/ui/` and replace any `IconPlaceholder` usages with the
> equivalent `lucide-react` icons.

## License

[Boost Software License - Version 1.0](./LICENSE)
