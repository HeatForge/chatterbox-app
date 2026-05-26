---
id: ISSUE-029
title: Project data tab (uploads and connectors)
status: pending
type: coding
layer: fullstack
phase: 4
depends_on: [ISSUE-022, ISSUE-027, ISSUE-005]
---

# Project data tab (uploads and connectors)

## Summary

**Project data** tab in `ChatContextPanel` when active chat belongs to a project.

## Requirements

- `ProjectDataPanel` in chat-context folder (primitives only inside)
- Upload files → `document.upload`
- List documents with sync status
- Add connector: `local_path` or `github` (repo indexing, not OAuth login)
- Sync / delete actions; confirm via overlay modal
- Toasts for sync started/completed/failed

## Acceptance criteria

- [ ] Tab visible only when `chat.projectId` is set
- [ ] Uploaded file appears in list and is tied to project
- [ ] User cannot access tab on `/chat` without selected project chat

## References

- [features.md](../features.md) — Project data tab
