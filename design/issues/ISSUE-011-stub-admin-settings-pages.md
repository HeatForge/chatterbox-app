---
id: ISSUE-011
title: Stub /admin and /settings pages
status: pending
type: coding
layer: FE
phase: 0
depends_on: [ISSUE-006, ISSUE-007]
---

# Stub `/admin` and `/settings` pages

## Summary

Flat-composed stub pages for admin and settings routes.

## Requirements

### `/admin`

Siblings: `AdminProvidersSection`, `AdminModelsSection`, `AdminWhitelistSection` (placeholder content)

### `/settings`

Siblings: `SettingsProfileSection`, `SettingsDefaultPromptSection`, `SettingsPreferencesSection`, `SettingsAppearanceSection` (placeholder content)

- Page-level CSS modules per route
- Admin route guarded client-side + server-side

## Acceptance criteria

- [ ] `/admin` and `/settings` render all sections as siblings
- [ ] Non-admin cannot access `/admin` (redirect or 403)

## References

- [features.md](../features.md)
