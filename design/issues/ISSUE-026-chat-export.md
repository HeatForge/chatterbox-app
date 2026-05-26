---
id: ISSUE-026
title: Export and save chat
status: pending
type: coding
layer: fullstack
phase: 3
depends_on: [ISSUE-022, ISSUE-017]
---

# Export and save chat

## Summary

Export full chat as markdown/plaintext from Chat tab in context panel.

## Requirements

- `chat.export({ chatId, format })`
- Copy to clipboard + download `.md` file
- Include variant markers or active variant only (document choice: active only)

## Acceptance criteria

- [ ] Export matches on-screen conversation
- [ ] Works for long threads (&lt; 10MB)

## References

- [features.md](../features.md)
