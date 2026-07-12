# Project: Personal AI Chat App

## Quick Context
Self-hosted Next.js app for personal AI chat with RAG and image generation.
LLMs via OpenRouter, image gen via fal.ai, auth via Better Auth (Postgres),
storage via MinIO/S3. Deployed via Docker on a personal VPS behind Nginx.

## Stack
- Next.js (App Router), React 19, TypeScript strict
- Vercel AI SDK v6 (streaming, tools)
- assistant-ui (chat UI)
- Kysely (DB queries), Postgres + pgvector
- Biome (lint+format), Vitest + Playwright (tests)
- Better Auth (auth), OpenRouter (LLMs), fal.ai (images)

## File Layout
- `app/` — Routes (App Router)
- `app/api/*/route.ts` — Thin controllers (call services, return responses)
- `lib/services/` — Business logic, DB queries, AI orchestration
- `lib/ai/tools/` — AI tool definitions (one file per tool)
- `lib/db/` — Kysely client + schema types
- `lib/storage.ts` — S3/MinIO client
- `lib/auth.ts` — Better Auth config
- `components/chat/` — Chat UI components
- `db/migrations/` — Plain SQL migration files

## Conventions
1. Routes are THIN: parse request → call service → return response
2. Services contain logic: DB queries, AI calls, business rules
3. AI tools: one file per tool in `lib/ai/tools/`, with Zod input schemas
4. Validate external inputs with Zod (request bodies, AI tool args, file uploads)
5. Don't validate internal function calls (TS handles it)
6. Server Components by default; `'use client'` only for interactive UI
7. CSS Modules for component styles
8. When creating features the PR's are to merge into the develop branch as that is automated to deploy to dev environment
9. Don't touch main or stable branches. These are branches specifically for production deployment with stable releases.
10. Document exported functions and non-obvious internal functions with JSDoc/TSDoc. Explain purpose, parameters/return behavior, side effects, cache ownership or invalidation, and error behavior when relevant; skip redundant comments on trivial helpers.
11. After each substantive task, create or update a concise task memory in `docs/memory/<task-slug>.md`. Every memory must begin with a title followed immediately by a one-line `> Description:` summary, so future agents can inspect just the first lines before loading the full memory. Record the outcome, key files, validation, and any important follow-up constraints; never include secrets.


## Commands
- `npm dev` — Local dev
- `npm build` — Production build
- `npm check` — Biome lint + format check
- `npm typecheck` — TypeScript
- `npm test` — Vitest
- `npm test:e2e` — Playwright
- `npm db:migrate` — Run SQL migrations

## Reference Docs
For detailed info on specific areas, see:
- @docs/architecture.md — System architecture overview
- @docs/features/chat.md — Chat implementation details
- @docs/features/rag.md — RAG pipeline details
- @docs/features/image-gen.md — Image generation flow

## Avoid
- Don't add deps without discussion
- Don't put secrets in committed files
- Don't write raw SQL except for vector operations and migrations
- Don't add 'use client' unless you need interactivity
