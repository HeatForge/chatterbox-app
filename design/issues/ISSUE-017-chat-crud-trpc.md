---
id: ISSUE-017
title: Chat tRPC CRUD
status: pending
type: coding
layer: BE
phase: 1
depends_on: [ISSUE-001, ISSUE-002]
---

# Chat tRPC CRUD

## Summary

`chat` router: list, get, create, update, delete.

## Requirements

- `chat.list` — filter by `projectId`, exclude hidden by default
- `chat.get`, `chat.create`, `chat.update`, `chat.delete`
- `chat.getSettings`, `chat.updateSettings` (system prompt, sampler)
- Ownership checks on all procedures

## Acceptance criteria

- [ ] tRPC procedures typed end-to-end
- [ ] Covered by manual or automated smoke test

## References

- [features.md](../features.md)
