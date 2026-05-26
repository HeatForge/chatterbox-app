---
id: ISSUE-018
title: ChatTreeSidebar
status: pending
type: coding
layer: FE
phase: 1
depends_on: [ISSUE-009, ISSUE-017, ISSUE-006]
---

# ChatTreeSidebar

## Summary

Left sidebar: chat list, new/hide/delete, navigation to `/chat/[chatId]`.

## Requirements

- Primitives: `ChatTreeItem`, `ScrollArea`, `Icon`, `ContextMenu`
- New chat → `chat.create` → `router.push(/chat/[id])`
- Hide/delete with `modal.confirm`
- Collapse toggle (page CSS class or local state)

## Acceptance criteria

- [ ] Selecting chat navigates to data route
- [ ] Does not import `ChatView` or `ChatContextPanel`

## References

- [features.md](../features.md) — ChatTreeSidebar
