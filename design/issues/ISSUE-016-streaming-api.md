---
id: ISSUE-016
title: Chat streaming API route
status: pending
type: coding
layer: BE
phase: 1
depends_on: [ISSUE-013, ISSUE-017]
---

# Chat streaming API route

## Summary

`POST /api/chat/stream` with SSE using Vercel AI SDK.

## Requirements

- Session auth (same as tRPC context)
- Verify `chatId` ownership
- `build-messages.ts` with prompt resolution (user default → project → chat)
- Stream tokens; persist assistant `MessageVariant` on completion
- `bodyParser` config compatible with Pages Router
- Error events to client; failed streams mark variant `status: error`

## Acceptance criteria

- [ ] User message → streamed assistant reply in UI
- [ ] Response uses admin-configured OpenRouter key

## References

- [architecture.md](../architecture.md) — Streaming route
