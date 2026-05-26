---
id: ISSUE-022
title: ChatContextPanel tabbed UI
status: pending
type: coding
layer: FE
phase: 2
depends_on: [ISSUE-010, ISSUE-017]
---

# ChatContextPanel tabbed UI

## Summary

Right panel with tabs: **Chat** (always) and **Project data** (when chat has `projectId`).

## Requirements

- `ContextPanelTabs` primitive
- **Chat tab:** system prompt, sampler, export (existing spec)
- **Project data tab:** placeholder until ISSUE-029; hide tab when no project
- Wired on `/chat/[chatId]` only (disabled on `/chat` index)

## Acceptance criteria

- [ ] Tab switch does not remount `ChatView`
- [ ] Project data tab appears only for project chats

## References

- [features.md](../features.md) — ChatContextPanel
