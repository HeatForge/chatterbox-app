---
id: ISSUE-030
title: Cross-chat project summaries
status: pending
type: coding
layer: BE
phase: 4
depends_on: [ISSUE-027, ISSUE-016]
---

# Cross-chat project summaries

## Summary

Rolling summaries per chat injected into other project chats' context.

## Requirements

- `ProjectSummary` model updates via `summarizeChat` job
- Trigger: idle timeout or N messages
- `build-messages` includes summaries (truncated, recency-ranked)

## Acceptance criteria

- [ ] Chat B in project references summarized content from chat A after job runs

## References

- [architecture.md](../architecture.md) — Context assembly
