# FE Refactor WP-3B — ChatShell Assembly

> Description: Combined runtime + sidebar + assistant-ui thread into `ChatShell` with focused hooks (`useChatThreads`, `useActiveThread`, `useChatNavigation`); `/chat-v2` now has feature parity with `/chat` for core flows.

## Outcome

WP-3B acceptance criteria met on branch `feature/fe-refactor`.

- **Shell:** `ChatShell` in `src/components/chat/chat-shell.tsx` wires `ChatSidebarShell`, `ChatRuntimeProvider`, assistant-ui `Thread`, and thread-action modals.
- **Hooks:** `useChatThreads()` (sidebar fetch/mutations), `useActiveThread()` (`?thread=` + selection state), `useChatNavigation()` (`router.replace` on switch).
- **Runtime seed:** `ChatInitialDataProvider` + `app-cache` seed `initialThread`; bootstrap navigates to prefetched or first available thread when URL has no `?thread=`.
- **Provider:** `ChatRuntimeProvider` accepts `basePath`, `onThreadChange`, and exposes `reloadThread` for rename cache invalidation.
- **Archived chats:** `isSendDisabled` on runtime + read-only notice; `Thread` accepts `showComposer={false}`.
- **Route:** `/chat-v2` reduced to `<ChatShell basePath="/chat-v2" />`; legacy `/chat` untouched (WP-4).

## Key files

| Area | Path |
|------|------|
| Chat shell | `src/components/chat/chat-shell.tsx` |
| Sidebar mutations | `src/components/chat/use-chat-threads.ts` |
| URL / selection | `src/components/chat/use-active-thread.ts` |
| Navigation | `src/components/chat/use-chat-navigation.ts` |
| Runtime provider | `src/components/assistant-ui/chat-runtime-provider.tsx` |
| Thread shell | `src/components/assistant-ui/thread.tsx` |
| Dev route | `src/app/chat-v2/page.tsx` |

## Capability checklist

| Capability | Status |
|------------|--------|
| Send / stream / complete | `useChatterboxRuntime` via `ChatRuntimeProvider` |
| Switch thread | Sidebar → `navigateToThread` → URL → runtime load |
| New chat | `startNewChat` clears URL + selection |
| Archive / CRUD | `useChatThreads` (same API calls as legacy) |
| URL `?thread=` deep link | `useActiveThread` + `useChatNavigation` |
| Cache acceleration | `getCachedThread` / `setCachedThread` on bootstrap + runtime cache |
| No EventSource leaks | `closeAllStreams` on thread change + unmount in runtime |
| Archived read-only | `isSendDisabled` + composer hidden |

## Validation

| Check | Result |
|-------|--------|
| `npm run typecheck` | OK |
| `npx biome check src/components/chat/ src/components/assistant-ui/ src/app/chat-v2/` | OK |
| Full-repo `npm run lint` | Pre-existing `src/lib/IconNames.ts` format drift (WP-0); not introduced by WP-3B |

## Constraints honored

- No changes under `src/lib/services/*` or `src/app/api/*`.
- `/chat` not cut over (WP-4).
- Legacy `use-chat-sidebar-actions.ts` retained for `/chat` until cutover.

## Follow-up

- WP-4: replace `/chat/page.tsx` with `ChatShell basePath="/chat"`, Playwright E2E, remove `/chat-v2`.
- WP-5: delete `message-blip/`, `chat-input/`, legacy sidebar actions after parity confirmed.
