---
id: ISSUE-015
title: Model allow/deny policy
status: pending
type: coding
layer: fullstack
phase: 1
depends_on: [ISSUE-013, ISSUE-014]
---

# Model allow/deny policy

## Summary

Admin UI and server enforcement for which models users may select.

## Requirements

- `ModelPolicy` CRUD via `admin.setModelPolicy`, `admin.listModels`
- `AdminModelsSection`: toggle allowed per model, set default
- `provider.listModels` returns only allowed models for chat UI

## Acceptance criteria

- [ ] Disallowed model cannot be selected or used in stream
- [ ] Default model applied to new chats

## References

- [data-model.md](../data-model.md) — ModelPolicy
