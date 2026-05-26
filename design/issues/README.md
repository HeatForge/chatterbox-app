# Chatterbox — Design Issues

Granular implementation tasks derived from the [roadmap](../roadmap.md). Each file is self-contained: metadata, requirements, acceptance criteria, and **status**.

## Metadata fields

| Field | Values |
|-------|--------|
| `id` | `ISSUE-NNN` |
| `status` | `pending` · `in_progress` · `done` · `blocked` |
| `type` | `design` · `architecture` · `coding` |
| `layer` | `FE` · `BE` · `fullstack` |
| `phase` | `0`–`6` (roadmap phase) |

## Status overview

| ID | Title | Type | Layer | Phase | Status |
|----|-------|------|-------|-------|--------|
| [ISSUE-001](./ISSUE-001-prisma-schema.md) | Prisma schema for chat domain | coding | BE | 0 | pending |
| [ISSUE-002](./ISSUE-002-auth-email-password-whitelist.md) | Email/password auth + whitelist | coding | fullstack | 0 | pending |
| [ISSUE-003](./ISSUE-003-admin-role-and-seed.md) | Admin role and bootstrap seed | coding | BE | 0 | pending |
| [ISSUE-004](./ISSUE-004-env-encryption-key.md) | Env validation and encryption key | coding | BE | 0 | pending |
| [ISSUE-005](./ISSUE-005-overlay-system.md) | Overlay system (modals, pop-ups, toasts) | coding | FE | 0 | pending |
| [ISSUE-006](./ISSUE-006-icon-component.md) | Icon component with AppIcon enum | coding | FE | 0 | pending |
| [ISSUE-007](./ISSUE-007-theme-switching.md) | Dark and light theme support | coding | FE | 0 | pending |
| [ISSUE-008](./ISSUE-008-pwa-support.md) | PWA installability | coding | fullstack | 0 | pending |
| [ISSUE-009](./ISSUE-009-chat-index-template.md) | `/chat` layout template page | coding | FE | 0 | pending |
| [ISSUE-010](./ISSUE-010-chat-chatid-data-page.md) | `/chat/[chatId]` data page | coding | FE | 0 | pending |
| [ISSUE-011](./ISSUE-011-stub-admin-settings-pages.md) | Stub `/admin` and `/settings` pages | coding | FE | 0 | pending |
| [ISSUE-012](./ISSUE-012-navbar.md) | NavBar in `_app.tsx` | coding | FE | 0 | pending |
| [ISSUE-013](./ISSUE-013-provider-config.md) | Provider config + encryption | coding | BE | 1 | pending |
| [ISSUE-014](./ISSUE-014-admin-provider-ui.md) | Admin provider and key UI | coding | FE | 1 | pending |
| [ISSUE-015](./ISSUE-015-model-policy.md) | Model allow/deny policy | coding | fullstack | 1 | pending |
| [ISSUE-016](./ISSUE-016-streaming-api.md) | Chat streaming API route | coding | BE | 1 | pending |
| [ISSUE-017](./ISSUE-017-chat-crud-trpc.md) | Chat tRPC CRUD | coding | BE | 1 | pending |
| [ISSUE-018](./ISSUE-018-chat-tree-sidebar.md) | ChatTreeSidebar | coding | FE | 1 | pending |
| [ISSUE-019](./ISSUE-019-chat-view-composer.md) | ChatView, composer, attachments | coding | FE | 1 | pending |
| [ISSUE-020](./ISSUE-020-message-variants.md) | Message variants and redo | coding | fullstack | 2 | pending |
| [ISSUE-021](./ISSUE-021-message-hover-actions.md) | Hover actions: copy, retry, arrows | coding | FE | 2 | pending |
| [ISSUE-022](./ISSUE-022-chat-context-panel-tabs.md) | ChatContextPanel tabbed UI | coding | FE | 2 | pending |
| [ISSUE-023](./ISSUE-023-settings-default-system-prompt.md) | Settings default system prompt | coding | fullstack | 2 | pending |
| [ISSUE-024](./ISSUE-024-chat-fork-tree.md) | Fork chat and tree indent | coding | fullstack | 3 | pending |
| [ISSUE-025](./ISSUE-025-bulk-select-delete.md) | Bulk message select and delete | coding | FE | 3 | pending |
| [ISSUE-026](./ISSUE-026-chat-export.md) | Export and save chat | coding | fullstack | 3 | pending |
| [ISSUE-027](./ISSUE-027-project-entity.md) | Project entity and CRUD | coding | BE | 4 | pending |
| [ISSUE-028](./ISSUE-028-project-sidebar-filter.md) | Project list and filter in sidebar | coding | FE | 4 | pending |
| [ISSUE-029](./ISSUE-029-project-data-tab.md) | Project data tab (uploads, connectors) | coding | fullstack | 4 | pending |
| [ISSUE-030](./ISSUE-030-project-summaries.md) | Cross-chat summaries | coding | BE | 4 | pending |
| [ISSUE-031](./ISSUE-031-pgvector-rag.md) | pgvector and RAG retrieval | coding | BE | 5 | pending |
| [ISSUE-032](./ISSUE-032-document-upload-pipeline.md) | Document upload and chunking | coding | fullstack | 5 | pending |
| [ISSUE-033](./ISSUE-033-connectors-sync.md) | Local and GitHub connectors | coding | BE | 5 | pending |
| [ISSUE-034](./ISSUE-034-tools-function-calling.md) | Tool toggles and function calling | coding | fullstack | 6 | pending |

## GitHub Issues sync

Markdown files in this directory are mirrored to **GitHub Issues** by the [sync-design-issues](../../.github/workflows/sync-design-issues.yml) workflow.

### Source of truth

**The repo wins.** Edit frontmatter or body here, push to `main` / `master`, and the workflow creates or updates the matching GitHub issue. Edits made only in the GitHub UI (title, body, labels) are **overwritten** on the next sync.

### What gets synced

| Frontmatter | GitHub |
|-------------|--------|
| `id` + `title` | Issue title: `[ISSUE-001] …` |
| `status: pending` / `in_progress` / `blocked` | Open + label `status:…` |
| `status: done` | Closed |
| `type`, `layer`, `phase` | Labels `type:…`, `layer:…`, `phase:…` |
| `phase` | Milestone `Phase N` (created if missing) |
| Markdown body | Issue description (with meta table + link back to this file) |

All synced issues receive the label **`chatterbox-design`** for filtering in the GitHub UI.

### Updating status

```yaml
status: in_progress   # → open on GitHub
status: done          # → closed on GitHub
```

Commit and push to **`main`** on **`HeatForge/chatterbox-app`**; the workflow runs when `design/issues/**` changes.

### Security

- Sync runs **only** on push to `main` (including merges into `main`), never on `pull_request` from forks.
- Repository and branch are **hard-coded** in the workflow and validated again in the sync script.
- The script does not use `${{ github.repository }}` or other workflow context for API targets.

If you rename the GitHub repo, update `CHATTERBOX_REPOSITORY` in [sync-design-issues.yml](../../.github/workflows/sync-design-issues.yml) and `EXPECTED_REPOSITORY` in [sync-design-issues.mjs](../../.github/scripts/sync-design-issues.mjs).

### Manual run

1. Open **Actions** → **Sync design issues to GitHub** → **Run workflow** (must be triggered on the `main` branch)
2. Optional: enable **dry_run** to log actions without API writes

### First-time setup

After pushing the workflow to GitHub `main`, run it once (push or manual dispatch on `main`). You should see 34 issues created with milestones **Phase 0**–**Phase 6**.

Filter in GitHub: `label:chatterbox-design` or use milestone / label columns in Projects.

## How to use

1. Pick an issue with `status: pending` and satisfied `depends_on`.
2. Implement per requirements; update parent docs if behavior changes.
3. Set `status: done` in the issue frontmatter when acceptance criteria pass.
4. Push — GitHub issue state updates on the next workflow run.
