---
id: ISSUE-005
title: Overlay system (modals, pop-ups, toasts)
status: done
type: coding
layer: FE
phase: 0
depends_on: [ISSUE-006]
---

# Overlay system (modals, pop-ups, toasts)

## Summary

Build **intelligent** shared overlay primitives: toast queue, modal stack, and anchored popovers—used app-wide instead of `alert()` or ad-hoc portals.

## Requirements

- `OverlayProvider` in `_app.tsx` wrapping the app
- `useOverlay()` hook with:
  - `toast.success(message)`, `toast.error`, `toast.info` — auto-dismiss, max queue, `aria-live`
  - `modal.open({ title, body, confirmLabel, cancelLabel, onConfirm })` — focus trap, ESC, backdrop click policy
  - `modal.confirm(...)` shorthand for destructive flows
  - `popover.open(anchorRef, content)` for lightweight confirms
- Primitives: `Toast`, `Modal`, `ModalBackdrop`, `Popover` (CSS modules)
- z-index scale documented in `globals.css`
- Stack multiple modals safely (LIFO close)

## Acceptance criteria

- [x] Demo toast and confirm modal from `/settings` or Storybook-style test button
- [x] Focus returns to trigger element on modal close
- [x] Feature issues (delete chat, etc.) use overlay API only

## References

- [architecture.md](../architecture.md) — Overlay system
- [ui-composition.md](../ui-composition.md)
