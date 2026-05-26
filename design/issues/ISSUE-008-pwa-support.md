---
id: ISSUE-008
title: PWA installability
status: pending
type: coding
layer: fullstack
phase: 0
depends_on: []
---

# PWA installability

## Summary

Make Chatterbox installable as a Progressive Web App on desktop and mobile for personal multi-device access.

## Requirements

- `public/manifest.json`: `name`, `short_name`, `start_url` (`/chat`), `display: standalone`, `theme_color`, `background_color`, icons 192/512
- Service worker: cache static assets (`_next/static`, fonts, icons); network-first for API/tRPC
- Optional offline fallback page (“You’re offline”) for navigations
- Integrate `next-pwa` or `@serwist/next` compatible with Next.js 15 Pages Router
- Document HTTPS requirement for production install prompt
- Meta tags in `_document.tsx`: `theme-color`, `apple-mobile-web-app-capable`

## Acceptance criteria

- [ ] Lighthouse PWA checklist passes (installable)
- [ ] “Install app” available in Chrome/Edge on desktop after production build
- [ ] Add to Home Screen works on Android/iOS Safari (best-effort)

## References

- [architecture.md](../architecture.md) — PWA
