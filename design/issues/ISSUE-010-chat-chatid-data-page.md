---
id: ISSUE-010
title: /chat/[chatId] data page
status: pending
type: coding
layer: FE
phase: 0
depends_on: [ISSUE-009, ISSUE-017]
---

# `/chat/[chatId]` data page

## Summary

Implement `src/pages/chat/[chatId].tsx` with the **same sibling DOM** as `/chat`, hydrated with thread data.

## Requirements

- Read `chatId` from `useRouter().query`
- `useChatPageState(chatId)` fetches `chat.get`, `message.list`
- Same JSX siblings as `index.tsx` (duplicate or shared `ChatPageView` with props only—no layout shell)
- Invalid/missing chat: toast + redirect to `/chat`
- Tree highlights `selectedChatId`

## Acceptance criteria

- [ ] `/chat/xyz` loads messages for thread `xyz`
- [ ] `/chat` and `/chat/[chatId]` JSX structure matches in code review
- [ ] Direct URL refresh works

## References

- [ui-composition.md](../ui-composition.md)
