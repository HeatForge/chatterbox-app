# Architecture

> System overview for Chatterbox — a self-hosted personal AI chat app with RAG and image generation.

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Routes | `src/app/` | Thin App Router pages and API controllers |
| Services | `src/lib/services/` | Business logic, DB (Kysely), AI orchestration |
| AI tools | `src/lib/ai/tools/` | One Zod-scoped tool per file |
| Storage | `src/lib/storage.ts` | MinIO/S3 client |
| Auth | `src/lib/auth.ts` | Better Auth config |
| DB | `src/lib/db/`, `db/migrations/` | Schema types and SQL migrations |

Routes parse requests, call services, and return responses. Services own queries, validation of external inputs, and side effects.

## Frontend stack

The UI is built on **Next.js App Router (React 19)**, **Tailwind CSS v4**, **shadcn/ui** (`src/components/ui/`), and **assistant-ui** (`@assistant-ui/react`) for chat primitives.

| Concern | Implementation |
|---------|----------------|
| Design tokens | `src/styles/tokens.css` bridged to shadcn CSS variables in `src/app/globals.css` |
| Primitives | shadcn `Button`, `Dialog`, `Sidebar`, `Message`, `Bubble`, etc. |
| Chat thread UI | assistant-ui `ThreadPrimitive`, `ComposerPrimitive`, `ActionBarPrimitive` |
| Icons | Lucide (`lucide-react`) on all migrated surfaces |
| Intent styling | `Intent` enum (`src/lib/Intent.ts`) mapped via `src/lib/intent-variants.ts` |
| Toasts | Sonner via `src/lib/toast.ts` |
| Overlays | shadcn `Dialog` / `AlertDialog` (declarative) |

`AppProviders` (`src/components/app-providers.tsx`) wraps the root layout with `TooltipProvider` and `<Toaster />`.

### Chat frontend layout

```
RootLayout
└── AppProviders
    └── /chat/layout.tsx (RSC prefetch)
        └── ChatInitialDataProvider
            └── page.tsx → ChatShell
                ├── ChatSidebarShellProvider
                │   └── ChatSidebarShell (shadcn Sidebar + resize hook)
                └── main
                    ├── header (SidebarTrigger + title)
                    └── ChatRuntimeProvider
                        └── Thread (assistant-ui + shadcn MessageScroller)
```

Focused hooks in `src/components/chat/`:

- `useActiveThread` — `?thread=` URL sync and selection state
- `useChatNavigation` — `router.replace` on thread switch
- `useChatThreads` — sidebar fetch and CRUD mutations

Runtime adapter in `src/lib/chat/runtime/` bridges the existing POST+SSE API to assistant-ui via `useExternalStoreRuntime`. See [features/chat.md](features/chat.md).

## Auth

| Layer | File | Behavior |
|-------|------|----------|
| Proxy | `src/proxy.ts` | Public: `/`, `/signup`, `/api/auth/*`. Unauthed → `/?auth=required`. |
| Server layouts | `chat/layout.tsx`, `settings/layout.tsx` | `getServerUserId()` |
| API | `src/app/api/**` | `getRequiredUserId()` → 401 |
| Client | `AppCacheSessionSync` | `authClient.useSession()` |

## Deployment

Docker on a personal VPS behind Nginx. `develop` branch deploys to dev; `main` / `stable` are production-only.

## Related docs

- [features/chat.md](features/chat.md) — chat runtime, component tree, capability matrix
- [style_guide.md](style_guide.md) — palette and typography
- [memory/fe-refactor-outcome.md](memory/fe-refactor-outcome.md) — FE refactor summary
