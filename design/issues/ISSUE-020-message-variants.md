---
id: ISSUE-020
title: Message variants and regenerate
status: pending
type: coding
layer: fullstack
phase: 2
depends_on: [ISSUE-016, ISSUE-019]
---

# Message variants and regenerate

## Summary

Multiple assistant outputs per user turn with active variant pointer.

## Requirements

- `MessageVariant` persistence per [data-model.md](../data-model.md)
- `message.regenerate`, `message.setActiveVariant`
- Invariant: exactly one `isActive` per `variantGroupId`
- Stream creates new variant on redo

## Acceptance criteria

- [ ] Redo adds variant; switching restores prior content
- [ ] DB constraint or transaction prevents dual active variants

## References

- [data-model.md](../data-model.md) — Variant invariants
