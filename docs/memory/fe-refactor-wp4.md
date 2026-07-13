# FE Refactor WP-4 — Cutover + E2E

> Description: Replaced legacy `/chat` page with `ChatShell`, removed `/chat-v2` dev route, added Playwright chat E2E, updated AGENTS.md stack, and fixed IconNames lint drift.

## Outcome

WP-4 acceptance criteria met on branch `feature/fe-refactor`.

- **Cutover:** `src/app/chat/page.tsx` is a thin `<ChatShell basePath="/chat" />` wrapper; ~670-line legacy client page removed.
- **Dev route removed:** `src/app/chat-v2/` deleted; default `basePath` is `/chat` in `ChatShell` and `ChatRuntimeProvider`.
- **E2E:** `e2e/chat.spec.ts` covers sign-in → send → stream complete → thread switch; `playwright.config.ts` starts dev server; requires `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` (skips when unset).
- **Docs:** `AGENTS.md` stack lists Tailwind + shadcn/ui, assistant-ui runtime adapter, Lucide.
- **IconNames:** generator emits 2-space indent; `biome.json` disables formatter on auto-generated `IconNames.ts`.

## Key files

| Area | Path |
|------|------|
| Chat route | `src/app/chat/page.tsx` |
| Shell | `src/components/chat/chat-shell.tsx` |
| E2E spec | `e2e/chat.spec.ts` |
| Playwright config | `playwright.config.ts` |
| Vitest exclude | `vitest.config.ts` (`e2e/**`) |
| Icon generator | `scripts/generate-icon-names.mjs` |
| Stack docs | `AGENTS.md` |

## Validation

| Check | Result |
|-------|--------|
| `npm run build` | OK — `/chat` only; no `/chat-v2` |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm test` | OK — 17 tests |
| `npm run test:e2e` | OK — 1 skipped (no `E2E_TEST_*` in env) |

## Manual QA checklist (WP-4)

| Item | Status |
|------|--------|
| Auth flows | Not run in this session |
| New chat | Covered by E2E flow (when creds set) |
| Streaming | Covered by E2E (when creds set) |
| Copy | Not automated |
| Sidebar CRUD | Not automated |
| Archive | Not automated |
| Cache | Not automated |
| Settings | Not automated |
| Mobile sidebar overlay | Not automated |

Set `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` for a whitelisted user with a configured LLM provider before running full E2E locally or in CI.

## Follow-up

- WP-5: delete `src/components/lib/`, legacy CSS modules, `use-chat-sidebar-actions.ts`, update architecture/chat docs.
