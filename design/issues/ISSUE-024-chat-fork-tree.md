---
id: ISSUE-024
title: Fork chat and tree indent
status: pending
type: coding
layer: fullstack
phase: 3
depends_on: [ISSUE-018, ISSUE-017]
---

# Fork chat and tree indent

## Summary

Fork thread from message selection; nested display in sidebar.

## Requirements

- `chat.fork({ chatId, upToMessageId })` copies messages, sets `parentChatId`, `depth`, `path`
- Sidebar indent `depth * 12px`
- Navigate to new `/chat/[newId]` after fork

## Acceptance criteria

- [ ] Fork appears nested under parent in tree
- [ ] Forked thread has correct message history length

## References

- [data-model.md](../data-model.md) — Fork invariants
