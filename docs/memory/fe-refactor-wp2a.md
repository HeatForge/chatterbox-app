# FE Refactor WP-2A — Runtime Adapter

> Description: assistant-ui `useExternalStoreRuntime` adapter over existing POST+SSE chat API, with message mapping, thread cache wrapper, and Vitest coverage — no UI or API route changes.

## Outcome

WP-2A acceptance criteria met on branch `feature/fe-refactor`.

- Installed `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`, `@assistant-ui/react-markdown`, `@ai-sdk/react`.
- Extracted chat runtime logic from `src/app/chat/page.tsx` and `src/lib/cache/app-cache.ts` into `src/lib/chat/runtime/*`.
- Preserved SSE contract: POST returns streaming assistant message; GET stream emits `content` | `done` | `error` with full `ChatMessageDto` JSON.
- Thread-id guard in `stream-message.ts` ignores stale SSE when active thread changes.
- Added `npm test` (`vitest run`) and `npm run check` (`biome check`) scripts.

## Key files

| Area | Path |
|------|------|
| Shared types | `src/lib/chat/types.ts` |
| DTO ↔ assistant-ui mapper | `src/lib/chat/runtime/message-mapper.ts` |
| POST send wrapper | `src/lib/chat/runtime/send-message.ts` |
| SSE stream + guard | `src/lib/chat/runtime/stream-message.ts` |
| app-cache wrapper | `src/lib/chat/runtime/thread-cache.ts` |
| Runtime hook | `src/lib/chat/runtime/chatterbox-runtime.ts` |
| Unit tests | `src/lib/chat/runtime/chatterbox-runtime.test.ts` |

## Public API

- `useChatterboxRuntime({ threadId, initialThread, projectId, onThreadChange, onError, isSendDisabled })` → `{ runtime, messages, thread, isRunning, loadThread, clearThread }`
- `sendChatMessage({ content, threadId?, projectId? })`
- `connectMessageStream(...)` with injectable `eventSourceFactory` for tests
- `createThreadCache(initialThread?)` — memory map + session `app-cache`

## Validation

| Check | Result |
|-------|--------|
| `npm test` | OK — 17 tests (14 mapper/stream tests + 3 existing) |
| `npm run typecheck` | OK |
| `npx biome check src/lib/chat/` | OK |
| `npm run lint` (full repo) | 1 pre-existing format issue in `src/lib/IconNames.ts` (unrelated to WP-2A) |

## Constraints honored

- No changes to `src/lib/services/chat.ts` or `src/app/api/*`
- `src/app/chat/page.tsx` left unchanged (wired in WP-2B/WP-4)
- Optimistic send, stream reconnect on load, and dual thread cache behavior preserved from legacy page

## Follow-up (WP-2B)

- Wire `useChatterboxRuntime()` into `ChatRuntimeProvider` and `/chat-v2` dev route
- Use `@assistant-ui/react-markdown` in thread shell markdown wrapper
