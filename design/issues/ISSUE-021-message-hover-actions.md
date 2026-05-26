---
id: ISSUE-021
title: Message hover actions
status: pending
type: coding
layer: FE
phase: 2
depends_on: [ISSUE-020, ISSUE-006]
---

# Message hover actions

## Summary

Assistant bubble actions: redo, variant arrows, retry, copy.

## Requirements

- `MessageActions` primitive with `Icon` buttons
- Copy to clipboard + `toast.success`
- Retry calls `message.retry`
- Visible on hover/focus only

## Acceptance criteria

- [ ] All four action types work on `/chat/[chatId]`
- [ ] Keyboard accessible

## References

- [features.md](../features.md)
