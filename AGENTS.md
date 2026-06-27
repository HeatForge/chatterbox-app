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

## Cursor Cloud specific instructions

This file's "Stack"/"Commands" sections are aspirational. The repo today is an early
frontend-only Next.js 16 / React 19 scaffold (named `chatterbox-app`): no API routes,
no DB, no auth, and no AI/storage wiring yet. The `pg`/`kysely`/`better-auth`/`@fal-ai`/
`ai` packages are installed but unused, so no Postgres, MinIO, OpenRouter, fal.ai, env
vars, or Docker services are needed to run or test the app.

- Setup: `npm install` (npm lockfile; Node 22 works, `@types/node` pins 20).
- Run (dev): `npm run dev` → http://localhost:3000. Main interactive page is `/chat`.
- Build: `npm run build` (passes; also runs `tsc`/typecheck). Lint: `npm run lint` (Biome).
- The actual scripts are only `dev`, `build`, `start`, `lint`, `format`, `icons:generate`.
  Commands referenced above like `npm test`, `npm typecheck`, `npm check`, `npm db:migrate`,
  and `npm test:e2e` do NOT exist yet — don't rely on them.
- `npm run lint` currently exits non-zero due to pre-existing Biome formatting violations in
  committed code (e.g. `src/lib/Intent.ts`, generated `src/lib/IconNames.ts`). This is a
  code/style issue, not an environment problem.
