# FE Refactor WP-2B — Thread Shell + /chat-v2

> Description: assistant-ui Thread shell with shadcn MessageScroller/Message/Bubble, composer, markdown, and `/chat-v2` dev route wired to `useChatterboxRuntime()` — no legacy module deletion yet.

## Outcome

WP-2B acceptance criteria met on branch `feature/fe-refactor`.

- **shadcn chat primitives:** `message-scroller`, `message`, `bubble`, `attachment`, `marker` (attachment + message-scroller added/updated via CLI; bubble/message/marker already present).
- **assistant-ui shell:** `thread.tsx`, `composer.tsx`, `markdown-text.tsx`, `chat-runtime-provider.tsx`.
- **Dev route:** `/chat-v2` with server-prefetch layout mirroring `/chat`; URL `?thread=` deep linking via `ChatRuntimeProvider`.
- **Runtime:** `useChatterboxRuntime()` from WP-2A; no changes to `src/lib/services/*` or `src/app/api/*`.
- **Legacy preserved:** `message-blip/` and `chat-input/` untouched.

## Key files

| Area | Path |
|------|------|
| Thread shell | `src/components/assistant-ui/thread.tsx` |
| Composer | `src/components/assistant-ui/composer.tsx` |
| Markdown | `src/components/assistant-ui/markdown-text.tsx` |
| Runtime provider | `src/components/assistant-ui/chat-runtime-provider.tsx` |
| Dev page | `src/app/chat-v2/page.tsx` |
| Dev layout | `src/app/chat-v2/layout.tsx` |
| shadcn scroller | `src/components/ui/message-scroller.tsx` |
| shadcn attachment | `src/components/ui/attachment.tsx` |

## Capability checklist

| Capability | Status |
|------------|--------|
| Send message | `ComposerPrimitive` → `useChatterboxRuntime.onNew` → POST |
| Stream updates | SSE via runtime `connectAssistantStream` |
| Stream complete | `onComplete` clears `isRunning` |
| Markdown (headings, code, links) | `MarkdownText` + `remark-gfm` on assistant parts |
| Composer ready/waiting/streaming/error | `useComposerVisualState()` maps thread + optimistic id |
| Copy message | `ActionBarPrimitive.Copy` on assistant messages |
| Scroll follows stream | `MessageScrollerProvider autoScroll` + `MessageScrollerItem` anchors |

## Dependencies added

- `remark-gfm`, `react-markdown` (explicit; peer of `@assistant-ui/react-markdown`)
- `@shadcn/react` (via shadcn `message-scroller` install)

## Validation

| Check | Result |
|-------|--------|
| `npm run typecheck` | OK |
| `npm run lint` (WP-2B paths) | OK |
| Full-repo `npm run lint` | Pre-existing `src/lib/IconNames.ts` format drift (WP-0) |

## Constraints honored

- No deletion of `message-blip/` or `chat-input/`.
- No changes under `src/lib/services/*` or `src/app/api/*`.
- No E2E (deferred to WP-4).

## Follow-up

- WP-3A: sidebar extract for `/chat-v2` shell.
- WP-3B: assemble `ChatShell` with sidebar + thread.
- WP-4: cutover `/chat`, Playwright E2E, remove `/chat-v2`.
- WP-5: delete `message-blip/` and `chat-input/` after parity confirmed.
