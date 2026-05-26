---
id: ISSUE-006
title: Icon component with AppIcon enum
status: pending
type: coding
layer: FE
phase: 0
depends_on: []
---

# Icon component with AppIcon enum

## Summary

Create a reusable `Icon` primitive that renders inline SVGs from a **public enum** with consistent sizing.

## Requirements

- `enum AppIcon` (or const object) exported from `~/types/icons` or `components/primitives/Icon/icons.ts`
- Initial icons: `send`, `attach`, `copy`, `retry`, `chevronLeft`, `chevronRight`, `redo`, `settings`, `admin`, `chat`, `folder`, `upload`, `trash`, `close`, `menu`, `sun`, `moon`
- Component API:
  ```tsx
  <Icon name={AppIcon.Send} size="sm" | "md" | "lg" className={...} />
  ```
- Size map: e.g. sm=16px, md=20px, lg=24px
- SVGs as TS modules or sprite; `currentColor` for theme compatibility
- `aria-hidden` by default; optional `title` for accessibility

## Acceptance criteria

- [ ] All listed icons render at three scales
- [ ] Used in NavBar and at least one chat primitive
- [ ] No raw inline SVG duplicated outside `Icon` folder

## References

- [ui-composition.md](../ui-composition.md) — Primitives
