# FE Refactor WP-1A — Overlay System

> Description: Replaced EventProvider and overlay hooks with Sonner toasts, shadcn Dialog/AlertDialog modals, and inline shadcn Alert auth banners.

## Outcome

WP-1A acceptance criteria met on branch `feature/fe-refactor`.

- **Toasts:** `showIntentToast()` in `src/lib/toast.ts` maps `Intent` → Sonner (`success` / `error` / `warning` / `info` / default). All call sites migrated: chat page, settings, `ChatInput`, `MessageActions`.
- **Modals:** Imperative `useModal()` replaced with declarative state in `src/app/chat/page.tsx` + `RenameDialog` / `ConfirmDeleteAlertDialog` in `ThreadActionModals.tsx` (shadcn `Dialog` / `AlertDialog`).
- **Banners:** `AuthQueryBanners` renders inline shadcn `Alert` with `intentClassName(Intent.WARNING)` for `?auth=required` and `?auth=not-whitelisted`.
- **Layout:** `EventProvider` removed; `AppProviders` wraps children with `TooltipProvider` + `<Toaster position="bottom-right" />`.

## Deleted

| Path | Notes |
|------|-------|
| `src/hooks/event-provider/` | Entire directory |
| `src/hooks/use-toaster/` | Entire directory + CSS |
| `src/hooks/use-modal/` | Entire directory + CSS |
| `src/hooks/use-banner/` | Entire directory + CSS |
| `src/components/chat/thread-action-modals.module.css` | Replaced by shadcn dialog layout |

## Key files

| Area | Path |
|------|------|
| Toast helper | `src/lib/toast.ts` |
| Client providers | `src/components/app-providers.tsx` |
| Root layout | `src/app/layout.tsx` |
| Thread modals | `src/components/chat/ThreadActionModals.tsx` |
| Auth banners | `src/components/auth/auth-query-banners.tsx` |
| Chat modal state | `src/app/chat/page.tsx` |

## Capability checklist

| Capability | Status |
|------------|--------|
| Intent-colored toasts | Sonner type + Lucide icons via shadcn `Toaster` |
| Modal confirm/cancel (rename, delete thread/project) | `Dialog` + `AlertDialog` with accessible titles |
| Auth banners `/?auth=required`, whitelist errors | Inline `Alert` on sign-in/sign-up pages |
| Toast placement bottom-right | `Toaster position="bottom-right"` |
| Dismiss toasts | Sonner default dismiss |

## Validation

| Check | Result |
|-------|--------|
| `npm run typecheck` | OK |
| `npm run lint` (WP-1A files) | OK |
| Grep zero `useModal`/`useToaster`/`useBanner`/`EventProvider` in `src/` | OK |
| `npm run check` | N/A — script not in `package.json`; use `npm run lint` |

**Note:** Full-repo `npm run lint` still reports format drift in `src/lib/IconNames.ts` (pre-existing, WP-0).

## Constraints honored

- No changes under `src/lib/services/*` or `src/app/api/*`.

## Follow-up

- WP-1B: migrate auth forms to shadcn Card/Input; auth banner styling may align further with page Tailwind layout.
- WP-1C: settings toasts already on Sonner; migrate custom Button/Select next.
