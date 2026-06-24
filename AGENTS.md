# Project: Personal AI Chat App

## Quick Context
Self-hosted Next.js app for personal AI chat with RAG and image generation.
LLMs via OpenRouter, image gen via fal.ai, auth via Better Auth (Postgres),
storage via MinIO/S3. Deployed via Docker on a personal VPS behind Nginx.

## Stack
- Next.js 15 (App Router), React 19, TypeScript strict
- Vercel AI SDK v6 (streaming, tools)
- assistant-ui (chat UI), shadcn/ui (components)
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
- `components/chat/` — assistant-ui customizations
- `components/ui/` — shadcn primitives (don't edit)
- `db/migrations/` — Plain SQL migration files

## Conventions
1. Routes are THIN: parse request → call service → return response
2. Services contain logic: DB queries, AI calls, business rules
3. AI tools: one file per tool in `lib/ai/tools/`, with Zod input schemas
4. Validate external inputs with Zod (request bodies, AI tool args, file uploads)
5. Don't validate internal function calls (TS handles it)
6. Server Components by default; `'use client'` only for interactive UI
7. CSS Modules for homegrown components; Tailwind only inside shadcn

## Commands
- `pnpm dev` — Local dev
- `pnpm build` — Production build
- `pnpm check` — Biome lint + format check
- `pnpm typecheck` — TypeScript
- `pnpm test` — Vitest
- `pnpm test:e2e` — Playwright
- `pnpm db:migrate` — Run SQL migrations

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
