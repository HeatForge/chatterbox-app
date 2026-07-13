# Chat

> Chat UI, runtime adapter, and component tree after the shadcn + assistant-ui refactor.

## Route

`/chat` renders `ChatShell` (`src/components/chat/chat-shell.tsx`). The page file is a thin server component wrapper.

`chat/layout.tsx` prefetches sidebar + first thread on the server and seeds `ChatInitialDataProvider` to avoid a client-side request waterfall.

## Runtime adapter

The adapter in `src/lib/chat/runtime/` maps the existing API contract to assistant-ui without changing services or routes.

| Module | Role |
|--------|------|
| `chatterbox-runtime.ts` | `useChatterboxRuntime()` — `useExternalStoreRuntime` hook |
| `send-message.ts` | POST `/api/chat/messages` or `/api/chat/threads/:id/messages` |
| `stream-message.ts` | EventSource `content` / `done` / `error` with thread-id guard |
| `message-mapper.ts` | `ChatMessageDto` ↔ assistant-ui message parts |
| `thread-cache.ts` | Wraps `app-cache.ts` for thread payloads |
| `types.ts` | Re-exports DTO types from services |

### SSE contract (unchanged)

```
POST → { userMessage, assistantMessage(status: "streaming") }
GET  → event: content | done | error (full ChatMessageDto JSON)
```

`stream-message.ts` ignores stale events when the active thread id changes mid-stream.

### Provider wiring

`ChatRuntimeProvider` (`src/components/assistant-ui/chat-runtime-provider.tsx`) calls `useChatterboxRuntime()`, exposes reload/cancel via context, and wraps children with `AssistantRuntimeProvider`.

## Component tree

```
ChatShell
├── ChatSidebarShellProvider
│   └── ChatSidebarShell
│       ├── SidebarHeader (new chat, new project, settings link)
│       ├── ChatSidebarThreadsPanel
│       │   ├── ProjectFolder (shadcn Collapsible)
│       │   └── sidebar-thread-item (SidebarMenuButton + DropdownMenu)
│       └── ChatSidebarArchivedPanel
└── main
    ├── header — SidebarTrigger + thread/project title
    └── ChatRuntimeProvider
        └── Thread
            ├── MessageScroller (shadcn)
            │   ├── UserMessage — Bubble + MessagePrimitive.Parts
            │   └── AssistantMessage — MarkdownText + ActionBar (copy)
            └── Composer — ComposerPrimitive + shadcn Textarea/Button
```

Supporting modals: `ThreadActionModals` (rename `Dialog`, delete `AlertDialog`).

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useActiveThread` | `use-active-thread.ts` | Parse/sync `?thread=`; derive project context |
| `useChatNavigation` | `use-chat-navigation.ts` | `router.replace` for thread and new-chat URLs |
| `useChatThreads` | `use-chat-threads.ts` | Sidebar state, load, rename/archive/delete/create |
| `useSidebarResize` | `use-sidebar-resize.ts` | Drag resize 220–480px (thin adapter over shadcn Sidebar) |

## Capability matrix (post-refactor)

Custom modules were replaced by shadcn/assistant-ui primitives. Capabilities retained:

| Area | Replacement | Retained behavior |
|------|-------------|-------------------|
| Message list | assistant-ui + shadcn `Message`/`Bubble` | Left/right alignment, markdown, copy action, scroll-follows-stream |
| Composer | `ComposerPrimitive` + shadcn `Textarea` | Enter to send, disabled while streaming, loading state |
| Sidebar | shadcn `Sidebar` + `useSidebarResize` | Resize, collapse, mobile overlay, auto-close on select |
| Thread items | `SidebarMenuButton` + `DropdownMenu` | Selected state, hover actions, click isolation |
| Project folders | shadcn `Collapsible` | Expand/collapse, nested threads |
| Overlays | Sonner + `Dialog`/`AlertDialog` | Intent toasts, confirm/cancel modals |
| Auth banners | shadcn `Alert` | Query-param auth errors |

**Deferred (WP-6):** agentic UI — `AgentActivityTimeline`, `ToolPermissionChip`, tool-call message parts.

## Tests

| Suite | Coverage |
|-------|----------|
| Vitest | `chatterbox-runtime.test.ts` — mapper + stream state machine |
| Playwright | `e2e/chat.spec.ts` — sign-in, send, stream complete, thread switch |

Set `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` for full E2E locally/CI.

## Key files

| Path | Role |
|------|------|
| `src/app/chat/page.tsx` | Route entry |
| `src/app/chat/layout.tsx` | Server prefetch |
| `src/components/chat/chat-shell.tsx` | Viewport assembly |
| `src/components/assistant-ui/thread.tsx` | Message thread UI |
| `src/components/assistant-ui/composer.tsx` | Input composer |
| `src/lib/chat/runtime/chatterbox-runtime.ts` | Runtime hook |
