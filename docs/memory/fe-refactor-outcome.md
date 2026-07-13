# FE Refactor Outcome

> Description: WP-0 through WP-5 complete — chat UI on shadcn/ui + assistant-ui; legacy custom primitives and Iconify removed; architecture docs filled.

## Summary

The frontend refactor replaced the monolithic `chat/page.tsx` (~970 lines) and custom `src/components/lib/` primitives with shadcn/ui, assistant-ui, and a focused runtime adapter. `/chat` now renders `ChatShell`; `/chat-v2` dev route removed in WP-4.

**Guiding principle applied:** replace custom implementations maximally; retain capabilities via library primitives and thin adapters only.

## Work packages

| WP | Outcome |
|----|---------|
| WP-0 | Tailwind + shadcn init, token bridge, baseline `ui/` components |
| WP-1A | Sonner toasts, Dialog/AlertDialog modals, inline Alert banners; EventProvider deleted |
| WP-1B | Auth forms on shadcn Card/Field; Lucide icons |
| WP-1C | Settings on shadcn Tabs/Combobox; custom Select deleted |
| WP-2A | `useExternalStoreRuntime` adapter + Vitest tests |
| WP-2B | assistant-ui Thread/Composer shell |
| WP-3A | `ChatSidebarShell` on shadcn Sidebar + resize hook |
| WP-3B | `ChatShell` assembly + focused hooks |
| WP-4 | `/chat` cutover, Playwright E2E, AGENTS.md stack update |
| WP-5 | Dead code deletion, docs, Iconify/MingCute removal |

## WP-5 deletions

- `src/components/lib/` (button, select, sidebar, thread, message-blip, chat-input, tool-permission-chip)
- `src/components/chat/chat-data.ts`, `use-chat-sidebar-actions.ts`
- Page CSS modules: `page.module.css`, `signup.module.css`, `chat.module.css`
- `src/lib/IconNames.ts`, `scripts/generate-icon-names.mjs`
- Dependencies: `@iconify/*`, `@mingcute/react`

**Retained:** `src/lib/Intent.ts` as enum consumed by `intent-variants.ts` and toast/alert styling.

## Documentation

| File | Content |
|------|---------|
| `docs/architecture.md` | System layers + FE stack |
| `docs/features/chat.md` | Runtime adapter, component tree, capability matrix |
| `AGENTS.md` | Stack and conventions for agents |

## Validation (WP-5)

| Check | Result |
|-------|--------|
| `grep @/components/lib/` | None |
| `grep *.module.css` in `src/` | None on migrated surfaces |
| `grep @iconify/react` in `src/components/` | None |
| `src/components/lib/` exists | No |
| `npm run build` | OK |
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm test` | OK — 17 tests |

## Follow-up

- **WP-6:** Agentic UI when backend tool registry lands (`AgentActivityTimeline`, `ToolPermissionChip`, extended SSE).
