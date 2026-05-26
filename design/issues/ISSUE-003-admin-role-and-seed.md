---
id: ISSUE-003
title: Admin role and bootstrap seed
status: pending
type: coding
layer: BE
phase: 0
depends_on: [ISSUE-001, ISSUE-002]
---

# Admin role and bootstrap seed

## Summary

Add `adminProcedure` to tRPC and seed first admin from `ADMIN_EMAIL`.

## Requirements

- `User.role` enum: `user` | `admin`
- `adminProcedure` in `src/server/api/trpc.ts`
- Seed script or post-migrate hook: if `ADMIN_EMAIL` set, ensure user is admin and in `AllowedEmail`

## Acceptance criteria

- [ ] Admin user can call `admin.*` procedures
- [ ] Non-admin receives FORBIDDEN on admin routes

## References

- [architecture.md](../architecture.md)
