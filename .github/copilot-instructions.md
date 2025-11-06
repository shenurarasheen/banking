## Quick context

This is a Next.js (app directory) TypeScript project (Next 16) using TailwindCSS (v4) and PostCSS. UI lives under `app/` and `components/`. Charts are implemented with `chart.js` + `react-chartjs-2`.

Use this file to guide automated coding agents and Copilot-style assistants so they can be productive without asking for basic repo facts.

## How to run (developer workflows)

- Install deps: `npm install` (this repo uses npm in examples). 
- Dev server: `npm run dev` -> starts Next dev server on localhost:3000.
- Build: `npm run build` then `npm run start` to run production build.
- Lint: `npm run lint` (ESLint is configured via `eslint-config-next`).

Files to check before changing runtime behavior: `package.json`, `next.config.ts`, `postcss.config.mjs`.

## Big-picture architecture & patterns

- App router: The `app/` directory uses nested layouts and route groups. Example: `app/(auth)/sign-in/page.tsx` — parentheses indicate route groups (not a URL segment).
- Server vs client components: Files inside `app/` are server components by default. Add `"use client"` at the top of a file when using React hooks, state, or browser-only APIs.
- UI primitives: Reusable UI components live in `components/ui/`. Higher-level components are in `components/` (e.g., `Sidebar.tsx`, `DoughnutChart.tsx`).
- Shared types/helpers: `types/index.d.ts` holds ambient/declared types, `lib/utils.ts` contains helpers.

## Styles and Tailwind conventions (project-specific)

- Tailwind v4 is used (see `package.json` and `postcss.config.mjs`). There are custom utility names used in markup (for example `sidebar`, `sidebar-logo`, and utilities like `size-6` and `max-xl:size-14` in `components/Sidebar.tsx`).
  - When you see `max-xl:...` it follows Tailwind's responsive prefix pattern (apply on screens up to `xl`). `size-6` is a custom utility (not standard Tailwind) — search `tailwind.config.*` or the codebase to find its definition; if not found, it may be provided by a global stylesheet or plugin.
- Prefer using existing CSS classes and tokens (e.g., `font-ibm-plex-serif`) to keep styling consistent.

## Next/image and assets

- `next/image` is used across components. Provide `width` and `height` numeric props (already used in `Sidebar.tsx`). Avoid replacing Next/Image with regular `<img>` unless needed for SSR/optimization reasons.

## Integration points & external deps

- Charts: `chart.js` + `react-chartjs-2` (see `components/DoughnutChart.tsx`). Check the component for how datasets and options are passed.
- Auth routes: `app/(auth)/` contains sign-in and sign-up pages — changes here can affect authentication flows.

## Common editing rules for an AI agent

- Always check whether a file is a server or client component before adding state/hooks; add `"use client"` as the very first line for client components.
- Match existing naming and class conventions: reuse `components/ui/*` primitives and `font-...`, `sidebar`, `size-*` classes.
- When adding new pages, follow the `app/` nested layout structure so new pages inherit layouts automatically.
- Avoid modifying `next.config.ts` or `postcss.config.mjs` unless necessary — call out changes and get human approval.

## Where to look for examples

- App entry / pages: `app/page.tsx`, `app/layout.tsx` and route groups like `app/(auth)/`.
- Sidebar and header patterns: `components/Sidebar.tsx`, `components/HeaderBox.tsx`, `components/Sidebar.tsx`.
- Charts: `components/DoughnutChart.tsx` and `components/TotalBalanceBox.tsx` for data/visual patterns.
- Utilities: `lib/utils.ts` and `constants/index.ts`.

## What to do if something's missing

- If you need to run tests or see CI commands but none exist, ask the repository owner which runner or commands to use. Do not invent CI pipelines.

---

If anything above is unclear or you'd like more detail about a specific area (routing, styling tokens, or auth flows), tell me which part to expand and I will update this file.
