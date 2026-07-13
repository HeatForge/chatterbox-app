# FE Refactor WP-0 — Foundation

> Description: Tailwind v4 + shadcn (base-nova) scaffold, token bridge to shadcn CSS variables, baseline `src/components/ui` primitives, and `intentVariants` helper — no page migrations.

## Outcome

WP-0 acceptance criteria met on branch `feature/fe-refactor` (based on `develop`).

- Tailwind CSS v4 + `@tailwindcss/postcss` via `postcss.config.mjs`; `@import "tailwindcss"` in `src/app/globals.css`.
- `npx shadcn@latest init` (RSC, Lucide, `src/components/ui`, `@/` aliases, `components.json` style `base-nova`).
- `src/lib/utils.ts` with `cn()` (from shadcn init).
- Shadcn semantic variables on `:root` / `.dark` reference existing `src/styles/tokens.css` palette (green-tinted dark surfaces, brand colors). `html` uses `dark` class for shadcn `dark:` utilities; SN Pro via tokens preserved (Geist font from init reverted in layout).
- Baseline components installed: button, input, textarea, label, dialog, alert-dialog, sonner, tooltip, separator, card, tabs, sidebar (+ sheet, input-group from sidebar/combobox deps), dropdown-menu, alert, badge, combobox, skeleton.
- `src/lib/intent-variants.ts`: `intentVariants()` / `intentClassName()` map `Intent` → shadcn button/badge variants + token-backed surface classes for tertiary/warning/success/info.

## Key files

| Area | Path |
|------|------|
| PostCSS | `postcss.config.mjs` |
| shadcn config | `components.json` |
| Global styles + bridge | `src/app/globals.css` |
| Design tokens (unchanged source) | `src/styles/tokens.css` |
| Utilities | `src/lib/utils.ts` |
| Intent mapping | `src/lib/intent-variants.ts` |
| UI primitives | `src/components/ui/*` |
| Mobile hook (sidebar) | `src/hooks/use-mobile.ts` |
| Lint overrides (shadcn vendored UI) | `biome.json` `overrides` |
| Scripts | `package.json` — added `typecheck`: `tsc --noEmit` |

## Validation

| Check | Result |
|-------|--------|
| `npx shadcn@latest info --json` | OK — framework Next.js 16, Tailwind v4, iconLibrary lucide, 19 components listed |
| `npm run build` | OK |
| `npm run lint` | OK (`biome check`) |
| `npm run typecheck` | OK |

## Constraints honored

- No changes under `src/lib/services/*` or `src/app/api/*`.
- No page/component migrations (legacy chat/auth/settings unchanged except root `layout.tsx`: `dark` class + `cn`; SN Pro retained).

## Follow-up (later WPs)

- WP-1A: mount `<Toaster />`, `TooltipProvider`; remove `EventProvider` overlay hooks.
- Migrate surfaces to shadcn primitives; delete custom `Button`/`Select`/overlay modules per capability matrix.
- Consider `turbopack.root` in `next.config.ts` to silence multi-lockfile workspace warning during build.
