---
id: ISSUE-009
title: /chat layout template page
status: pending
type: coding
layer: FE
phase: 0
depends_on: [ISSUE-006, ISSUE-007]
---

# `/chat` layout template page

## Summary

Implement `src/pages/chat/index.tsx` as the **structural template** for the chat UI—no active thread data.

## Requirements

- Flat composition: `ChatTreeSidebar`, `ChatView`, `ChatContextPanel` as siblings
- `index.module.css`: three-column grid
- `ChatView` shows empty state (“Select a chat or create one”)
- `ChatContextPanel` disabled or shows generic hint (no thread selected)
- Tree may list chats; selecting navigates to `/chat/[chatId]`
- **No** `message.list` or stream calls on this route

## Acceptance criteria

- [ ] `/chat` renders three columns without errors
- [ ] Page file lists all three feature components explicitly
- [ ] Matches [ui-composition.md](../ui-composition.md) rules

## References

- [features.md](../features.md) — `/chat` route
