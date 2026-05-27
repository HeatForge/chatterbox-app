---
id: ISSUE-002
title: Email/password auth and email whitelist
status: pending
type: coding
layer: fullstack
phase: 0
depends_on: [ISSUE-001]
---

# Email/password auth and email whitelist

## Summary

Configure Better Auth for **email/password only**. Remove GitHub OAuth from config and env. Gate sign-up with `AllowedEmail`. Also implement the introduction screen that asks to auth before showing any content. This is a personal app there is no plan to show content to not whitelisted users.

## Requirements

- Remove `socialProviders.github` from `better-auth/config.ts`
- Remove `BETTER_AUTH_GITHUB_*` from `src/env.js` and `.env.example`
- Implement `databaseHooks.user.create.before` + `hooks.before` whitelist check
- Sign-in and sign-up UI (no OAuth buttons)

## Acceptance criteria

- [ ] Whitelisted email can register and sign in
- [ ] Non-whitelisted email rejected on sign-up
- [ ] No GitHub OAuth routes or env vars required
- [ ] Auth prompt landing page
- [ ] Working whitelist auth
- [ ] Non-whitelisted page

## References

- [architecture.md](../architecture.md) — Authentication default
