# App performance and caching
> Description: Server-rendered chat/settings shells, a bounded per-user client cache, and lower-cost database/streaming paths were added to reduce repeat loading work.

## Outcome
- `/chat` and `/settings` now have server layouts that provide initial data before their interactive client pages mount.
- Browser cache data is scoped to the authenticated user, persisted in `sessionStorage`, bounded to four threads and 100 messages per thread, expires after 15 minutes, and is cleared on sign-out or account changes.
- Chat thread selection is represented by `/chat?thread=<id>` and cached threads render before background revalidation.

## Key files
- `src/lib/cache/app-cache.ts` — memory/session cache, persistence, limits, and user isolation.
- `src/components/AppCacheSessionSync.tsx` — connects cache lifecycle to Better Auth session state.
- `src/app/chat/layout.tsx`, `src/components/chat/ChatInitialDataProvider.tsx` — server chat bootstrap.
- `src/app/settings/layout.tsx`, `src/components/settings/SettingsInitialDataProvider.tsx` — fast settings shell without waiting for provider catalogs.
- `src/lib/services/projects.ts` — sidebar now loads projects and threads in two queries.
- `src/lib/services/ai-providers.ts` — provider model catalogs use a ten-minute in-process TTL cache.
- `src/lib/services/chat.ts` — SSE uses in-process generation events and 500 ms database checkpoints instead of DB polling/per-token writes.
- `db/migrations/008_sidebar_lifecycle_indexes.sql` — partial indexes for active and archived sidebar lookups.

## Constraints and follow-up
- The server-side provider-model and SSE event caches are process-local; a multi-instance deployment needs shared invalidation/pub-sub before relying on them across instances.
- Session storage is an acceleration layer only. API authorization and database reads remain the source of truth.
- Do not add API keys or other secrets to browser cache entries or task memories.

## Validation
- `npx vitest run src/lib/cache/app-cache.test.ts`
- `npm run build`
