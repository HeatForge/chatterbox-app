---
id: ISSUE-004
title: Env validation and encryption key
status: done
type: coding
layer: BE
phase: 0
depends_on: []
---

# Env validation and encryption key

## Summary

Extend T3 env schema for secrets used in Phase 1+.

## Requirements

- Add `ENCRYPTION_KEY` (required in production)
- Add `ADMIN_EMAIL` (optional bootstrap)
- Document in `.env.example`
- `lib/crypto.ts`: encrypt/decrypt helpers for provider API keys

## Acceptance criteria

- [ ] Build fails in production without `ENCRYPTION_KEY`
- [ ] Round-trip encrypt/decrypt unit test or manual verify

## References

- [architecture.md](../architecture.md) — Environment variables
