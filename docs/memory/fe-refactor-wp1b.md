# FE Refactor WP-1B: Auth Forms

> Description: Migrated sign-in, sign-up, and auth query banners to shadcn Card/Field/Input/Button/Alert with Lucide icons; deleted auth.module.css.

## Outcome

Auth surfaces now use shadcn primitives instead of custom `Button` and CSS modules. Inline `Alert` replaces `useBanner()` for `?auth=required` and `?auth=not-whitelisted` query banners.

## Key files

| Action | File |
|--------|------|
| Migrated | `src/components/auth/sign-in-form.tsx` |
| Migrated | `src/components/auth/sign-up-form.tsx` |
| Migrated | `src/components/auth/auth-query-banners.tsx` |
| Added | `src/components/ui/field.tsx` (shadcn Field/FieldGroup) |
| Updated | `src/app/page.tsx`, `src/app/signup/page.tsx` (banner + form column layout) |
| Deleted | `src/components/auth/auth.module.css` |

## Capabilities retained

- Email/password sign-in with error display and submit loading state
- Sign-up with username validation, whitelist redirect to `/?auth=not-whitelisted`
- Auth query banners for sign-in required and not-whitelisted messages
- Navigation links between sign-in and sign-up pages
- Intent mapping for tertiary buttons via `intentVariants(Intent.TERTIARY)`

## Validation

- `npx biome check` on WP-1B files: pass
- `npm run typecheck`: pass
- `npm run check`: script not defined in `package.json` (use `npm run lint`)

## Follow-up

- WP-1A may still remove `useBanner` / `EventProvider` globally; auth no longer depends on them
- `page.module.css` / `signup.module.css` remain for page centering; delete in WP-5 cleanup
