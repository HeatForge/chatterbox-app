# FE Refactor WP-1C: Settings Page

> Description: Migrated settings page to shadcn Tabs/Card/Field/Select/Combobox/Button; deleted settings.module.css and custom Select module.

## Outcome

Settings UI now uses shadcn primitives end-to-end. Provider catalog uses shadcn `Select`; chat and embedding model pickers use a grouped searchable `ModelCombobox` built on shadcn `Combobox`. Category navigation uses responsive `Tabs` (vertical sidebar on desktop, horizontal on mobile). All custom `Button` and `Select` imports removed from settings.

## Key files

| Action | File |
|--------|------|
| Migrated | `src/app/settings/page.tsx` |
| Added | `src/components/settings/model-combobox.tsx` |
| Added | `src/components/ui/select.tsx` |
| Deleted | `src/app/settings/settings.module.css` |
| Deleted | `src/components/lib/select/Select.tsx` |
| Deleted | `src/components/lib/select/select.module.css` |

## Capabilities retained

- Categorized model lists (grouped by provider name in `ModelCombobox`)
- Searchable provider/model picker (Combobox filter on chat + embedding models)
- System prompt textarea with save
- Provider add/edit/delete (enable toggle, remove)
- Embedding model selection with separate save
- Responsive mobile tabs via `useIsMobile` + `Tabs` orientation switch
- Intent-colored buttons via `intentVariants` (tertiary back, success enabled state, destructive remove)
- Sonner toasts for save/error feedback (from WP-1A)

## Validation

- `npx biome check` on WP-1C files: pass
- WP-1C files typecheck clean
- `npm run typecheck`: fails on pre-existing errors in `ChatSidebar.tsx` / `chat-sidebar-provider.tsx` (WP-3A in progress, unrelated to settings)
- `npm run lint`: fails on pre-existing repo issues (e.g. `src/lib/IconNames.ts` format); WP-1C files pass isolated check

## Follow-up

- Custom `Button` remains in chat sidebar/thread (WP-3A/5)
- Manual QA: add provider, toggle enable, pick chat/embedding models, save system prompt, mobile tab switch
