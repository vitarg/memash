# AGENTS.md

## Project
- Name: memash
- Type: web-based meme generator
- Stack: React + TypeScript + Vite + Tailwind CSS + shadcn/ui

## How to run
- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`

## Checks
- Lint: `pnpm lint`
- Check: `pnpm check`
- Format: `pnpm format`
- Format + fix: `pnpm format:fix`
- Typecheck: `pnpm typecheck`

## Conventions
- Use TypeScript strict mode.
- Prefer functional React components and hooks.
- Use path aliases from `vite.config.ts`/`tsconfig.json`.
- Styling via Tailwind CSS and existing shadcn/ui components.
- Keep feature logic in page/widget files; utilities in `src/lib`.

## Folder structure
- `src/app`: app bootstrap and root layout.
- `src/pages`: page-level screens and routes.
- `src/widgets`: composed feature blocks built from smaller pieces.
- `src/components`: reusable UI components.
- `src/shared`: shared hooks, constants, and cross-cutting helpers.
- `src/lib`: pure utilities and helpers.
- `public`: static assets.

## Code style and naming
- Use named exports by default; default exports only when required by tooling.
- Use `PascalCase` for components, `camelCase` for functions/vars, `UPPER_SNAKE_CASE` for constants.
- Keep components small; extract logic into hooks in `src/shared` or `src/lib`.
- Avoid side effects in render; use `useEffect` for imperative work.

## Branch/commit workflow
- Solo project: push directly to `main`, no PRs.
- Keep commits small and descriptive (imperative mood).
- Use the roadmap to sequence work and track scope.

## Roadmap
- Keep `ROADMAP.md` up to date when scope or priorities change.

## Tests and definition of done
- Update or add tests when behavior changes, if a test harness exists.
- Run `pnpm check` and `pnpm typecheck` before marking done.
- Ensure the app builds and the main flow (upload, text, download) still works.

## UI/design constraints
- Preserve existing layout patterns and component styling.
- Prefer Tailwind utilities over custom CSS unless necessary.
- Keep interactions accessible (focus states, keyboard where appropriate).
