# Frontend Refactor Audit

> Description: Comprehensive codebase structure audit for pivoting chat UI to shadcn + assistant-ui primitives. Covers routes, components, styling, API contracts, and phased migration guidance.

## Executive Summary

Chatterbox-app is a Next.js 16 App Router personal AI chat app with a **fully custom frontend** (CSS Modules, hand-rolled primitives, custom SSE streaming). **Neither shadcn/ui nor assistant-ui is installed** — they are referenced in `AGENTS.md` and agent skills but absent from `package.json`. The highest-risk refactor target is `src/app/chat/page.tsx` (~970 lines), which owns all chat state, API calls, streaming, sidebar CRUD, and rendering.

**Backend is stable.** Services, API routes, auth, and DB schema are well-layered and should largely survive a FE refactor intact.

---

## 1. App Router Structure

### Pages (4 total)

| Route | File | Type | Purpose |
|-------|------|------|---------|
| `/` | `src/app/page.tsx` | Server | Sign-in landing |
| `/signup` | `src/app/signup/page.tsx` | Server | Registration |
| `/chat` | `src/app/chat/page.tsx` | **Client** | Main chat UI (monolith) |
| `/settings` | `src/app/settings/page.tsx` | **Client** | AI provider/model config |

### Layout Hierarchy

```
RootLayout (server) — fonts, AppCacheSessionSync, EventProvider
├── / (server page)
├── /signup (server page)
├── /chat/layout.tsx (server, async prefetch) → ChatInitialDataProvider → page.tsx (client)
└── /settings/layout.tsx (server, async prefetch) → SettingsInitialDataProvider → page.tsx (client)
```

### Auth (not in layouts)

| Layer | File | Behavior |
|-------|------|----------|
| Page guard | `src/proxy.ts` | Next.js 16 proxy. Public: `/`, `/signup`, `/api/auth/*`. Unauthed → `/?auth=required`. Authed on `/` → `/chat`. |
| Server layouts | `chat/layout.tsx`, `settings/layout.tsx` | `getServerUserId()` via Better Auth |
| API routes | All `src/app/api/**` | `getRequiredUserId()` → 401 JSON |
| Client session | `src/components/AppCacheSessionSync.tsx` | `authClient.useSession()` |

No `middleware.ts`. No layout-level `redirect()`.

### API Routes (19 handlers)

**Chat (16):**
- `GET/POST /api/chat/threads` — list/create threads
- `GET/PATCH/DELETE /api/chat/threads/[threadId]` — thread CRUD
- `POST /api/chat/threads/[threadId]/messages` — send message
- `GET /api/chat/threads/[threadId]/messages/[messageId]/stream` — SSE
- `POST /api/chat/threads/[threadId]/archive|unarchive`
- `POST /api/chat/messages` — first message (creates thread)
- `GET/POST /api/chat/projects` + `[projectId]` CRUD/archive
- `POST /api/chat/projects/[projectId]/threads`

**Settings (4):** `/api/settings/ai`, `/embedding`, `/providers`, `/providers/[providerId]`

**Auth:** `/api/auth/[...all]`

**Legacy (ignore):** `/api/db-get`, `/api/db-post`

---

## 2. Chat UI Component Tree

```
ChatLayout (RSC)
└── ChatInitialDataProvider
    └── ChatPage (client, ~970 lines)
        └── SidebarProvider
            ├── ChatSidebar
            │   └── Sidebar (lib) → panels → ProjectFolder / ChatThread / ArchivedThread
            │       └── Thread (lib) — sidebar list item, NOT message thread
            └── <main>
                ├── header (SidebarToggle + title)
                ├── messageList (plain div)
                │   ├── UserMessageBlip → MessageBlip
                │   └── AssistantMessageBlip → MessageBlip
                │       ├── ThinkingSection (built, NOT wired)
                │       ├── MarkdownContent
                │       └── MessageActions (copy only)
                └── ChatInput (composer with state machine)
```

### State Management

| Layer | Mechanism | Holds |
|-------|-----------|-------|
| SSR bootstrap | `ChatInitialDataProvider` | Initial sidebar + first thread |
| Chat page | Local `useState`/`useRef` | All sidebar, thread, message, input state |
| Thread cache | `threadCacheRef` + `app-cache.ts` | 4 threads, 100 msgs, 15min TTL |
| Streaming | `streamsRef: Map<messageId, EventSource>` | Per-message SSE |
| Sidebar chrome | `SidebarProvider` context | open, width, mobile, resize |
| Modals/toasts | `useModal()`, `useToaster()` | Confirmations, errors |
| URL | `?thread=<id>` | Thread selection only |

**No global store** (Zustand, React Query, etc.).

### Custom → assistant-ui Primitive Mapping

| Custom | Path | assistant-ui equivalent |
|--------|------|------------------------|
| MessageBlip | `lib/message-blip/` | `Message` / message parts |
| ChatInput | `lib/chat-input/` | `Composer` |
| messageList div | inline in `page.tsx` | `ThreadPrimitive.Viewport` |
| ChatSidebar + panels | `components/chat/` | `ThreadList` (partial) |
| Thread (lib) | `lib/thread/` | `ThreadListItem` |
| Sidebar (lib) | `lib/sidebar/` | App shell / layout |

### Pain Points

1. **God component** — `page.tsx` owns everything
2. **Duplicate types** — local `ChatMessage`/`ThreadPayload` vs service `ChatMessageDto`/`ChatThreadPayload`
3. **Thinking not wired** — `ThinkingSection` exists but `page.tsx` only passes `content`
4. **Flat message model** — no tool calls, runs, multi-part messages
5. **SSE lifecycle** — no thread-id guard on stream handlers; background streams may update stale state
6. **ChatInput toolbar stubs** — Attachments/Tools/Settings show "Not implemented" toasts
7. **Dead code** — `chat-data.ts` (mock UIMessage), empty `docs/architecture.md`
8. **Naming collision** — `Thread` (lib) = sidebar row, not message thread viewport

---

## 3. Styling Architecture

**CSS Modules + `tokens.css`. No Tailwind. No shadcn.**

| Layer | Location | Notes |
|-------|----------|-------|
| Tokens | `src/styles/tokens.css` | Dark-only custom palette |
| Global | `src/app/globals.css` | Reset, color-scheme: dark |
| Components | 23 `*.module.css` files | Co-located with components |
| Variants | `data-*` attributes | Not CVA/Tailwind |
| Icons | `@iconify/react` (MingCute) | `lucide-react` in deps but unused |

### Custom Primitives → shadcn Equivalents

| Custom | shadcn |
|--------|--------|
| `Button` | `Button` |
| `Select` (~475 lines, hand-rolled) | `Select` / `Combobox` |
| `Sidebar` | `Sidebar` |
| `use-modal` hook | `Dialog` / `AlertDialog` |
| `use-toaster` hook | `Sonner` |
| `use-banner` hook | `Alert` |
| `MessageBlip` | shadcn chat primitives (`Message`, `Bubble`) |

### Token Bridge (for shadcn init)

```
--color-background      → --background
--color-text            → --foreground
--color-primary         → --primary
--color-text-muted      → --muted-foreground
--surface-overlay-border → --border
```

### Duplication to Eliminate

- Focus ring CSS in 8+ files
- Scrollbar styling in 5 files
- Bordered surface recipe in 15+ places
- Form input styles duplicated across `settings`, `auth`, `thread-action-modals`
- `.shell` layout duplicated in `chat.module.css` and `settings.module.css`

---

## 4. Backend / API Contracts (Stable — Preserve)

### Critical DTOs (`src/lib/services/chat.ts`)

```typescript
ChatMessageDto = { id, role: "user"|"assistant", content, status: "completed"|"streaming"|"error", error, createdAt }
ChatThreadPayload = ThreadSummary & { systemPrompt, messages: ChatMessageDto[] }
SidebarData = { projects[], standalone[], archived: { projects[], standalone[] } }
SendMessageResponse = { threadId, thread, userMessage, assistantMessage }
```

### Streaming Protocol (Custom SSE — NOT AI SDK wire format)

```
POST /messages → 201 { userMessage, assistantMessage (status: "streaming") }
GET .../stream → EventSource

event: content  → full ChatMessageDto with partial content
event: done     → final ChatMessageDto (status: "completed")
event: error    → ChatMessageDto (status: "error")
```

AI SDK `streamText` is server-side only. Client uses `EventSource`, not `useChat`.

### DB Schema (chat-related)

- `chat_threads` — id, user_id, project_id, title, model_id, system_prompt, archived_at, deleted_at
- `chat_messages` — id, thread_id, role, content, status, error
- `projects` — id, user_id, title, archived_at, deleted_at
- `project_embeddings` — RAG vectors (pgvector)
- `ai_user_settings`, `ai_providers` — model config

**No runs/tools tables in committed schema.**

### FE Coupling Map

| File | Coupling |
|------|----------|
| `page.tsx` | **Tightest** — all fetch, types, SSE, optimistic UI |
| `app-cache.ts` | Imports service DTOs |
| `ChatInitialDataProvider` | Imports `ChatThreadPayload` (good) |
| `ChatSidebar` + panels | Loose — only `{ id, title }` |
| `MessageBlip`, `ChatInput` | **Decoupled** — pure presentation |

---

## 5. Agent Skills & Docs Status

| Resource | Status |
|----------|--------|
| `.agents/skills/shadcn/SKILL.md` | Present — generic shadcn guidance, chat primitive rules |
| `.agents/skills/assistant-ui/SKILL.md` | Present — runtime selection, `useChatRuntime` quick start |
| `components.json` | **Missing** |
| `docs/architecture.md` | **Empty** |
| `docs/features/chat.md` | **Missing** |
| `docs/memory/app-performance-cache.md` | Present — cache/streaming design |
| `docs/memory/agentic-chat-tools.md` | **Not on disk** (git status only) |

---

## 6. Refactor Scope Matrix

### Do Not Touch (stable)

- `src/lib/services/chat.ts`, `projects.ts`, `rag.ts`, `ai-providers.ts`
- `src/app/api/chat/**/route.ts`
- `src/lib/db/schema.ts`, migrations
- `src/proxy.ts`, `src/lib/auth.ts`, `src/lib/auth-client.ts`
- Server prefetch layouts (`chat/layout.tsx`, `settings/layout.tsx`)

### Replace / Rewrite (high impact)

| File | Action |
|------|--------|
| `src/app/chat/page.tsx` | Split into runtime provider + assistant-ui primitives |
| `src/components/lib/chat-input/` | → assistant-ui `Composer` + shadcn `Textarea`/`Button` |
| `src/components/lib/message-blip/` | → assistant-ui `Message` + shadcn `Bubble`/`MessageScroller` |
| `src/hooks/event-provider/` | → shadcn `Sonner` + `Dialog` |
| `src/components/lib/button/`, `select/` | → shadcn `Button`, `Select` |
| `src/app/settings/page.tsx` | → shadcn form components (`Field`, `Input`, `Card`, `Tabs`) |
| `src/components/auth/*` | → shadcn `Input`, `Button`, `Card`, `Label` |

### Keep Logic, Reskin UI (medium impact)

| File | Action |
|------|--------|
| `src/components/chat/ChatSidebar.tsx` | Keep project/thread logic; use shadcn `Sidebar` shell |
| `src/components/lib/sidebar/` | Evaluate vs shadcn `Sidebar` |
| `src/lib/cache/app-cache.ts` | Reconcile with assistant-ui runtime or `useExternalStoreRuntime` |

### Delete Candidates

- `src/components/chat/chat-data.ts` — unused mock data
- `src/hooks/use-modal/`, `use-toaster/`, `use-banner/` — after shadcn migration

---

## 7. Recommended Phased Migration

### Phase 0 — Foundation
1. `npx shadcn@latest init` — Tailwind + `components.json`
2. Bridge `tokens.css` → shadcn CSS variables in `globals.css`
3. Add `src/lib/utils.ts` with `cn()` helper
4. Install core shadcn: `button`, `input`, `textarea`, `dialog`, `sonner`, `sidebar`

### Phase 1 — Non-chat surfaces
1. Migrate auth forms (`sign-in-form`, `sign-up-form`)
2. Migrate settings page (forms, provider cards)
3. Replace `use-toaster` → Sonner, `use-modal` → Dialog
4. Update `RootLayout` — swap `EventProvider` for `Toaster` + `TooltipProvider`

### Phase 2 — assistant-ui runtime
1. Install `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`, `@ai-sdk/react`
2. Create runtime adapter over existing API (two options):
   - **A:** Custom `ExternalStoreRuntime` wrapping current POST+SSE protocol
   - **B:** New transport endpoint aligned with `AssistantChatTransport` / AI SDK stream format
3. Scaffold `Thread` component from assistant-ui templates
4. Skin with project tokens (not default shadcn theme)

### Phase 3 — Chat viewport
1. Add shadcn chat primitives: `message-scroller`, `message`, `bubble`
2. Replace inline `messageList` + `MessageBlip` with assistant-ui + shadcn
3. Replace `ChatInput` with `ComposerPrimitive`
4. Extract sidebar from `page.tsx` into dedicated component
5. Wire `ThinkingSection` / reasoning parts when backend supports them

### Phase 4 — Agentic features (when backend lands)
1. Extend message model for tool-call parts, `requires-action` status
2. Add `AgentActivityTimeline`, `ToolPermissionChip` using shadcn primitives
3. Extend SSE events or migrate to AI SDK stream parts
4. Write `docs/memory/agentic-chat-tools.md`

### Phase 5 — Cleanup
1. Remove unused CSS Modules for replaced components
2. Delete dead code (`chat-data.ts`, custom modal/toast hooks)
3. Consolidate duplicate types (import DTOs from services on client)
4. Update `AGENTS.md` to reflect actual stack
5. Fill `docs/architecture.md` and `docs/features/chat.md`

---

## 8. Key Risks & Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Streaming transport | Keep custom SSE vs AI SDK wire format | Custom adapter first (Phase 2A); migrate transport later if needed |
| Tailwind adoption | Full vs hybrid | Hybrid — Tailwind for shadcn components, keep CSS Modules for page layouts during transition |
| Icon library | Keep MingCute vs switch to Lucide | Lucide (shadcn default) unless strong preference for MingCute |
| Sidebar | Keep custom resize vs shadcn Sidebar | Evaluate shadcn Sidebar; custom resize logic may be worth keeping |
| Message markdown | Keep `MarkdownContent` vs `@assistant-ui/react-markdown` | Keep custom markdown CSS (120+ lines) even with shadcn chat shell |
| Cache layer | Keep `app-cache.ts` vs assistant-ui state | `useExternalStoreRuntime` to bridge during migration |

---

## 9. File Index (Quick Reference)

### App
- `src/app/layout.tsx` — root shell
- `src/app/chat/layout.tsx` — server prefetch
- `src/app/chat/page.tsx` — **PRIMARY REFACTOR TARGET**
- `src/app/chat/chat.module.css`
- `src/app/settings/page.tsx`, `settings.module.css`

### Chat components
- `src/components/chat/ChatSidebar.tsx`
- `src/components/chat/ChatThread.tsx`
- `src/components/chat/ProjectFolder.tsx`
- `src/components/chat/ChatInitialDataProvider.tsx`
- `src/components/chat/sidebar-panels/`
- `src/components/chat/ThreadActionModals.tsx`

### Lib primitives
- `src/components/lib/button/`
- `src/components/lib/select/`
- `src/components/lib/sidebar/`
- `src/components/lib/thread/`
- `src/components/lib/chat-input/`
- `src/components/lib/message-blip/`

### Services (stable)
- `src/lib/services/chat.ts`
- `src/lib/services/projects.ts`
- `src/lib/services/rag.ts`
- `src/lib/services/ai-providers.ts`

### Infrastructure
- `src/lib/cache/app-cache.ts`
- `src/styles/tokens.css`
- `src/proxy.ts`
- `src/hooks/event-provider/`

### Agent skills (read before refactoring)
- `.agents/skills/shadcn/SKILL.md`
- `.agents/skills/assistant-ui/SKILL.md`

---

## Validation Checklist (post-refactor)

- [ ] `npm check` — Biome lint/format
- [ ] `npm typecheck` — TypeScript strict
- [ ] `npm test` — Vitest
- [ ] `npm test:e2e` — Playwright
- [ ] Manual: sign-in → chat → send message → stream → copy
- [ ] Manual: sidebar thread switch, project create, archive/unarchive
- [ ] Manual: settings provider CRUD
- [ ] Mobile: sidebar overlay, responsive layouts
