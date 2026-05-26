---
id: ISSUE-028
title: Project list and sidebar filter
status: pending
type: coding
layer: FE
phase: 4
depends_on: [ISSUE-018, ISSUE-027]
---

# Project list and sidebar filter

## Summary

Projects section in `ChatTreeSidebar` with filter and leave-project control.

## Requirements

- `ProjectListItem` rows above chat tree
- Click project → `chat.list({ projectId })` + show **Leave project** button
- Leave clears filter → non-project chats
- `Icon` for folder/project

## Acceptance criteria

- [ ] Only project chats visible when filter active
- [ ] Leave project restores global chat list

## References

- [features.md](../features.md)
