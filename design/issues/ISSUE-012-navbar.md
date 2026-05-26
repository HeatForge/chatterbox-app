---
id: ISSUE-012
title: NavBar in _app.tsx
status: pending
type: coding
layer: FE
phase: 0
depends_on: [ISSUE-006, ISSUE-002]
---

# NavBar in `_app.tsx`

## Summary

App-wide navigation with links only—no feature component imports.

## Requirements

- `NavBar` primitive: links to `/chat`, `/settings`, `/admin` (admin link if `session.user.role === admin`)
- Active route highlight via `useRouter().pathname`
- Use `Icon` for optional nav icons
- Render above `{Component}` in `_app.tsx`

## Acceptance criteria

- [ ] Nav visible on all authenticated pages
- [ ] Admin link hidden for non-admin users

## References

- [ui-composition.md](../ui-composition.md)
