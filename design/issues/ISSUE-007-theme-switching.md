---
id: ISSUE-007
title: Dark and light theme support
status: done
type: coding
layer: FE
phase: 0
depends_on: [ISSUE-001]
---

# Dark and light theme support

## Summary

Global CSS variable themes with user-selectable light, dark, and system preference.

## Requirements

- `src/styles/globals.css`: semantic tokens (`--color-bg`, `--color-surface`, `--color-text`, `--color-border`, `--color-accent`, …) under `[data-theme="light"]` and `[data-theme="dark"]`
- `ThemeSync` component in `_app.tsx`: read `settings.get` theme, apply to `document.documentElement`
- `prefers-color-scheme` listener when theme is `system`
- `/settings` Appearance section wires to `settings.update`
- All new CSS modules use variables only (no `#hex` in feature CSS)
- Sun/moon icons via `Icon` component

## Acceptance criteria

- [x] Toggle in settings switches theme without reload
- [x] System theme follows OS when selected
- [x] `/chat`, `/admin`, overlays readable in both themes

## References

- [architecture.md](../architecture.md) — Theming
- [ISSUE-023](./ISSUE-023-settings-default-system-prompt.md) (settings page)
