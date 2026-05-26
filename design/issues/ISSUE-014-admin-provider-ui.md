---
id: ISSUE-014
title: Admin provider and API key UI
status: pending
type: coding
layer: FE
phase: 1
depends_on: [ISSUE-011, ISSUE-013, ISSUE-003]
---

# Admin provider and API key UI

## Summary

Wire `AdminProvidersSection` on `/admin` to manage providers.

## Requirements

- List providers, edit base URL, set API key (masked input), enable/disable
- `admin.upsertProvider`, `admin.listProviders`, `admin.testProvider`
- Confirm destructive actions via overlay `modal.confirm`

## Acceptance criteria

- [ ] Admin can save OpenRouter credentials and enable provider
- [ ] Test connection shows toast success/failure

## References

- [features.md](../features.md) — Admin
