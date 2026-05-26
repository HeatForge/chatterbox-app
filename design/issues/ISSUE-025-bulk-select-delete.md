---
id: ISSUE-025
title: Bulk message select and delete
status: pending
type: coding
layer: FE
phase: 3
depends_on: [ISSUE-019, ISSUE-005]
---

# Bulk message select and delete

## Summary

Multi-select messages for batch delete (and fork entry point).

## Requirements

- Selection mode toggle in `ChatView` toolbar
- Checkboxes on `MessageBubble`
- `message.deleteMany` with `modal.confirm`
- `toast` on success

## Acceptance criteria

- [ ] Delete 2+ messages in one action
- [ ] Selection clears after delete

## References

- [features.md](../features.md)
