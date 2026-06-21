# AGENTS.md

Persistent project memory for AI agents working in this repository. Keep this file updated when you add features, change conventions, or discover important gotchas.

## Project overview

**chatterbox-app** (v0.1.0) is a full-stack application template: React frontend, Spring Boot backend, PostgreSQL, and GraalVM native-image production builds. It is early-stage — the implemented surface area is small, but the scaffolding is intentional and should be extended rather than replaced.

```
┌─────────────┐   /api/* (Vite proxy)   ┌──────────────────┐
│ React/Vite  │ ───────────────────────► │ Spring Boot :8080 │
│ :5173       │                         └────────┬─────────┘
└─────────────┘                                  │ JDBC
                                                 ▼
                                        ┌──────────────────┐
                                        │ PostgreSQL       │
                                        └──────────────────┘
```

## Directory layout

| Path | Purpose |
|------|---------|
| `frontend/` | React + Vite + TypeScript SPA |
| `backend/` | Spring Boot Maven project (`com.chatterboxapp`) |
| `scripts/` | Bash dev/build/test/DB tooling |
| `db/` | Reference schema (`schema.sql`); not executed at runtime |
| `dist/` | Build output (created by `scripts/build`) |
| `.env` | Local DB credentials (gitignored) |
| `.env.example` | Env template |
| `config.yaml` | Minimal project metadata |

### Backend packages (`backend/src/main/java/com/chatterboxapp/`)

| Package | Contents |
|---------|----------|
| `Application.java` | Spring Boot entry point |
| `config/` | Cross-cutting config (`WebConfig`, `SecurityConfig`) |
| `controller/` | REST controllers (`HealthController`, `AuthController`) |
| `entity/` | JPA entities (`User`, `EmailWhitelist`) |
| `repository/` | Spring Data repositories |
| `service/` | Business logic (`AuthService`) |
| `dto/` | Request/response records |
| `security/` | `AppUserDetailsService` |
| `exception/` | Auth exceptions and `GlobalExceptionHandler` |

Packages not yet present: OpenAPI-specific DTO layering beyond records.

### Frontend source (`frontend/src/`)

| Path | Purpose |
|------|---------|
| `main.tsx` | React entry (`StrictMode`) |
| `App.tsx` | Router shell with `AuthProvider` |
| `AppRoutes.tsx` | React Router route table |
| `auth/` | `AuthContext`, `ProtectedRoute` |
| `pages/` | `SignInPage`, `SignUpPage`, `ChatPage`, `UnauthorizedPage` |
| `components/` | `SignInForm`, `SignUpForm`, primitives |
| `api/client.ts` | Fetch-based HTTP client (`credentials: "include"`) |
| `api/auth.ts` | Auth API helpers |
| `__tests__/` | Vitest + Testing Library tests |

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite 6, TypeScript 5.7 (strict), Vitest, React Router |
| Backend | Spring Boot 3.4.1, Java 21, Spring Web, Spring Data JPA, Spring Security |
| Database | PostgreSQL; Flyway migrations; Hibernate `ddl-auto: validate` |
| Production | GraalVM native image via `native-maven-plugin` |
| Tooling | Bash scripts, Maven, npm |

**Not in use yet:** global state libraries beyond auth context, OpenAPI, Lombok, Docker Compose, CI/CD.

## Current features

| Feature | Location | Notes |
|---------|----------|-------|
| Health check API | `GET /api/health` in `HealthController` | Returns `{ status, db }`; DB field is product name + version or error |
| Session auth API | `AuthController` | `POST /api/auth/signup`, `login`, `logout`; `GET /api/auth/me` |
| Email whitelist signup | `V2__auth.sql`, `AuthService` | Signup rejected with `403 not_whitelisted` unless email is in `email_whitelist` |
| Sign-in / sign-up UI | `SignInPage`, `SignUpPage` | Wired to backend; duplicate email shows message on signup form |
| Gated chat page | `ChatPage` + `ProtectedRoute` | `/chat` redirects to `/unauthorized` when not signed in |
| Users table | `V1__init.sql`, `User` entity | Stores `password_hash` (BCrypt) via `V2__auth.sql` |
| Template cloning | `scripts/clone-template` | See known issues below |

## Scripts

All scripts use `#!/usr/bin/env bash`, `set -euo pipefail`, and resolve `PROJECT_ROOT` from their own location.

| Script | Purpose |
|--------|---------|
| `scripts/start-db` | Ensure Docker is running; launch/reuse `chatterbox-app-postgres` container from `.env` credentials |
| `scripts/start` | Source `.env`; start frontend (`npm run dev`) and backend (`mvn spring-boot:run`) in parallel |
| `scripts/build` | Build frontend to `dist/frontend/`, native backend binary to `dist/backend/app` |
| `scripts/test` | Run frontend and/or backend tests (`-f` / `-b` flags) |
| `scripts/clone-template` | Copy template to a new project directory with token replacement |

**Typical dev flow:** `scripts/start-db` → `scripts/start`

## Environment and configuration

### Root `.env` variables

| Variable | Default | Used by |
|----------|---------|---------|
| `DB_HOST` | `localhost` | Spring `application.yml`, `start-db` output |
| `DB_PORT` | `5432` | Spring, Docker port mapping |
| `DB_NAME` | `app_db` | Spring, Docker `POSTGRES_DB` |
| `DB_USER` | `app_user` | Spring, Docker `POSTGRES_USER` |
| `DB_PASSWORD` | `changeme` | Spring, Docker `POSTGRES_PASSWORD` |

### Frontend env

- Vite loads env from project root (`envDir: ".."` in `vite.config.ts`).
- `VITE_API_URL` is supported in `api/client.ts` but **not documented in `.env.example`**. Leave unset in dev (relative URLs via Vite proxy). Set for production when API is on a different origin.

### Backend config (`backend/src/main/resources/application.yml`)

- Server port: `8080`
- Flyway enabled at `classpath:db/migration`
- JPA `ddl-auto: validate` — schema is owned by Flyway, not Hibernate
- `open-in-view: false`

## Conventions

### General

- Project name: `chatterbox-app` (kebab-case)
- Java package: `com.chatterboxapp` (no hyphen)
- Maven coordinates: `com.chatterboxapp:chatterbox-app:0.1.0`
- Prefer extending existing patterns over introducing new frameworks

### Backend (Java)

- 2-space indent
- Constructor injection (no field `@Autowired`)
- All REST controllers use `@RequestMapping("/api")` prefix
- Responses currently use inline `Map.of(...)` — no DTO classes yet
- New migrations: `backend/src/main/resources/db/migration/V{n}__{description}.sql`
- After adding migrations, keep `db/schema.sql` in sync as reference documentation

### Frontend (TypeScript/React)

- ES modules; default exports for components
- Interfaces colocated with components until shared types emerge
- API calls go through `frontend/src/api/client.ts` (`api.get`, `post`, `put`, `delete`); auth helpers in `api/auth.ts`
- Use `credentials: "include"` for session cookies (already set in `client.ts`)
- Tests in `src/__tests__/`; mock `api/auth` or `api/client` rather than `fetch` directly
- Styling via plain CSS in `App.css` (no Tailwind or CSS-in-JS)

### Dev networking

- Vite dev server proxies `/api` → `http://localhost:8080`
- CORS in `WebConfig` allows `http://localhost:5173` for `/api/**`

## Database

**Source of truth:** Flyway migrations in `backend/src/main/resources/db/migration/`.

Current schema (`V1__init.sql` + `V2__auth.sql`):

```sql
users (id, email, display_name, password_hash, created_at, updated_at)
email_whitelist (id, email, created_at)
```

`db/schema.sql` documents the intended full schema and should stay in sync with migrations.

**Whitelist new users (dev):** insert into `email_whitelist` before signup, e.g.

```sql
INSERT INTO email_whitelist (email) VALUES ('you@example.com');
```

**Docker container:** `chatterbox-app-postgres` (managed by `scripts/start-db`).

## API patterns

| Aspect | Convention |
|--------|------------|
| Base path | `/api` on all controllers |
| Auth | Session cookie (`JSESSIONID`); CSRF disabled for `/api/**` |
| Error handling | `GlobalExceptionHandler` returns `{ error, message }` JSON |
| Auth errors | `account_exists` (409), `not_whitelisted` (403), `invalid_credentials` (401) |
| Validation | `spring-boot-starter-validation` on auth DTOs |

When adding endpoints, follow `HealthController` structure: controller in `controller/`, inject dependencies via constructor, return typed responses (consider records/DTOs as the API grows).

## Testing

| Layer | Command | Notes |
|-------|---------|-------|
| Frontend | `cd frontend && npm test` | Vitest; jsdom; mocks API client |
| Backend | `cd backend && mvn test` | `@SpringBootTest` context load test |
| Both | `scripts/test` | Use `-f` or `-b` for one side only |

**Gotcha:** Backend tests require a running PostgreSQL instance with Flyway migrations applied. There is no H2/test profile. Run `scripts/start-db` before backend tests.

## Production build

`scripts/build` produces:

- `dist/frontend/` — static Vite build
- `dist/backend/app` — GraalVM native binary
- `dist/.env.example` — env template for deployment

Requires GraalVM 21+. Deploy with nginx serving frontend and the native binary as a systemd service.

## Known gaps and gotchas

Update this section when you fix or discover issues.

| Issue | Detail |
|-------|--------|
| `clone-template` token mismatch | Script expects `__TEMPLATE_NAME__` / `__TEMPLATE_PACKAGE__` placeholders; codebase uses hardcoded `chatterbox-app` / `com.chatterboxapp` |
| Schema drift | ~~`db/schema.sql` has `idx_users_email` not present in `V1__init.sql`~~ resolved in `V2__auth.sql` |
| README incomplete | Missing `scripts/start-db`, `VITE_API_URL`, and updated DB setup steps |
| No users API beyond auth | User CRUD/admin whitelist API not implemented yet |
| Missing `vite.svg` | `index.html` references `/vite.svg`; no `frontend/public/` directory |
| Backend tests need live DB | No in-memory test database configured |

## Agent maintenance notes

When you make significant changes, update the relevant sections above:

1. **New feature** — add to "Current features" with file paths
2. **New package or convention** — update "Conventions" and directory layout
3. **New script or env var** — update "Scripts" or "Environment"
4. **Fixed gap** — remove or update the entry in "Known gaps"
5. **New gotcha** — add to "Known gaps" so future agents avoid repeating mistakes

Keep entries factual and path-specific. Prefer tables and short bullets over prose.
