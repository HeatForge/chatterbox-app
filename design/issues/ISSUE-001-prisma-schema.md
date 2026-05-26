---
id: ISSUE-001
title: Prisma schema for chat domain
status: pending
type: coding
layer: BE
phase: 0
depends_on: []
---

# Prisma schema for chat domain

## Summary

Replace demo `Post` model and add all Chatterbox entities per [data-model.md](../data-model.md).

## Requirements

- Models: `ChatThread`, `Message`, `MessageVariant`, `Project`, `ProjectSummary`, `ProjectDocument`, `DocumentChunk`, `UserSettings`, `AllowedEmail`, `ProviderConfig`, `ModelPolicy`
- Extend `User` with `role: UserRole`
- Indexes and relations as documented
- Run `db:push` or initial migration

## Acceptance criteria

- [ ] `pnpm db:push` succeeds
- [ ] Generated client includes new models
- [ ] Demo `Post` removed

## References

- [data-model.md](../data-model.md)
