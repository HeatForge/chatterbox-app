---
id: ISSUE-019
title: ChatView, composer, and attachments
status: pending
type: coding
layer: FE
phase: 1
depends_on: [ISSUE-010, ISSUE-016, ISSUE-015]
---

# ChatView, composer, and attachments

## Summary

Center column: messages, composer, model select, image attach, streaming UI.

## Requirements

- `MessageList`, `MessageBubble`, `Composer`, `ChatInput`, `ChatStatusBar` primitives
- Model dropdown from `provider.listModels`
- Image attachment upload + preview
- Stream consumption on `/chat/[chatId]` only
- Page passes `ChatInput` / `ChatStatusBar` as children if required by composition rules

## Acceptance criteria

- [ ] Send message streams reply on `[chatId]` page
- [ ] Empty state only on `/chat` index

## References

- [features.md](../features.md) — ChatView
