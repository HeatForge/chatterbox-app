---
id: ISSUE-027
title: Project entity and CRUD
status: pending
type: coding
layer: BE
phase: 4
depends_on: [ISSUE-001, ISSUE-017]
---

# Project entity and CRUD

## Summary

`project` tRPC router and assign chat to project.

## Requirements

- `project.list`, `get`, `create`, `update`, `delete`
- `chat.update({ projectId })` to assign/unassign
- Project-level `systemPrompt`, `samplerDefaults`

## Acceptance criteria

- [ ] User can create project and assign existing chat

## References

- [data-model.md](../data-model.md) — Project
