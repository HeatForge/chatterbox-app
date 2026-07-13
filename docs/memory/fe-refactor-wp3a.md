# FE Refactor WP-3A — Sidebar Extract

> Description: Extracted chat sidebar into shadcn `Sidebar` shell with `SidebarMenuButton`+`DropdownMenu` threads, `Collapsible` project folders, and thin drag-resize adapter; deleted custom sidebar/thread modules.

## Outcome

WP-3A acceptance criteria met on branch `feature/fe-refactor`.

- **Shell:** `ChatSidebarShell` + `ChatSidebarShellProvider` in `src/components/chat/chat-sidebar-shell.tsx` and `chat-sidebar-provider.tsx` replace `ChatSidebar` and custom `SidebarProvider`/`SidebarToggle`.
- **Threads:** `SidebarThreadItem` uses shadcn `SidebarMenuButton` / `SidebarMenuSubButton` with hover `DropdownMenu` actions; `ChatThread` and `ArchivedThread` migrated to Lucide icons.
- **Projects:** `ProjectFolder` uses shadcn `Collapsible` + `SidebarMenuSub` for nested threads.
- **Sections:** `SidebarGroup` + `SidebarGroupLabel` replace `SidebarSectionDivider`.
- **Resize:** `useSidebarResize` kept as thin adapter in `src/components/chat/use-sidebar-resize.ts` (220–480px) with `--sidebar-width` on shadcn `SidebarProvider`.
- **Chrome:** Lock/unlock + mobile auto-close via `useChatSidebarChrome`; header toggle via shadcn `SidebarTrigger`.
- **Page trim:** Sidebar mutation handlers moved to `useChatSidebarActions`; types/utils to `chat-sidebar-types.ts` / `chat-sidebar-utils.ts`.
- **`page.tsx`:** 1004 → 679 lines (−325).

## Deleted

| Path | Notes |
|------|-------|
| `src/components/lib/sidebar/` | Entire directory + CSS |
| `src/components/lib/thread/` | Entire directory + CSS |
| `src/components/lib/sidebar-section-divider/` | Entire directory + CSS |
| `src/components/chat/ChatSidebar.tsx` | Replaced by `chat-sidebar-shell.tsx` |
| `src/components/chat/chat-sidebar.module.css` | Tailwind in shell |
| `src/components/chat/project-folder.module.css` | Collapsible layout |
| `src/components/chat/thread-tree.module.css` | `SidebarMenuSub` |
| `src/components/chat/sidebar-panels/chat-sidebar-archived-panel.module.css` | Tailwind empty state |

## Key files

| Area | Path |
|------|------|
| Sidebar shell UI | `src/components/chat/chat-sidebar-shell.tsx` |
| Provider + resize/lock | `src/components/chat/chat-sidebar-provider.tsx` |
| Resize hook | `src/components/chat/use-sidebar-resize.ts` |
| Thread row primitive | `src/components/chat/sidebar-thread-item.tsx` |
| Sidebar mutations | `src/components/chat/use-chat-sidebar-actions.ts` |
| Types / utils | `src/components/chat/chat-sidebar-types.ts`, `chat-sidebar-utils.ts` |
| Chat page | `src/app/chat/page.tsx` |
| shadcn Collapsible | `src/components/ui/collapsible.tsx` (added) |

## Capability checklist

| Capability | Status |
|------------|--------|
| Resize 220–480px | `useSidebarResize` + `--sidebar-width` |
| Collapse/expand | shadcn `SidebarTrigger` + offcanvas |
| Mobile overlay | shadcn `Sheet` via `Sidebar` |
| Auto-close on select | `notifyItemSelected` (mobile always; desktop when unlocked) |
| Project folders expand/collapse | `Collapsible` + `expandedProjectIds` |
| Thread hover actions | `SidebarMenuAction` + `DropdownMenu` |
| Archive panel toggle | Footer archive/inbox button |
| New chat + settings nav | Footer shadcn `Button` + Lucide |
| Lock/unlock sidebar | `ChatSidebarLockButton` |

## Validation

| Check | Result |
|-------|--------|
| `npm run typecheck` | OK |
| `npx biome check src/app/chat/page.tsx src/components/chat/` | OK |
| `npm run lint` (full repo) | 7 pre-existing format issues in `src/components/ui/*` (WP-2B) + `IconNames.ts`; not introduced by WP-3A |
| Grep zero `lib/sidebar`, `lib/thread`, `sidebar-section-divider` in `src/` | OK |

## Constraints honored

- No changes under `src/lib/services/*` or `src/app/api/*`.

## Follow-up

- WP-3B: assemble `ChatShell`, further extract `useChatThreads` / `useActiveThread` / `useChatNavigation`.
- WP-5: remove remaining `components/lib/button` usage in chat surfaces after cutover.
