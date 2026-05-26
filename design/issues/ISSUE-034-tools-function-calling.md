---
id: ISSUE-034
title: Tool toggles and function calling
status: pending
type: coding
layer: fullstack
phase: 6
depends_on: [ISSUE-016, ISSUE-019]
---

# Tool toggles and function calling

## Summary

Per-chat tool enablement with AI SDK function calling loop.

## Requirements

- `chat.enabledTools` JSON
- Tool toggle UI in `ChatView`
- Stream handler runs tool loop; persist `role: tool` messages
- At least one built-in tool (e.g. web search stub or calculator TBD)

## Acceptance criteria

- [ ] Enabled tool executes and result appears in thread
- [ ] Disabled tools not sent upstream

## References

- [roadmap.md](../roadmap.md) — Phase 6
