# Chatterbox — UI Composition Rules

This document defines how React pages and components are structured. The goal is **flat page-owned composition**: opening a page file shows every major UI block that page renders, with no hidden nesting inside layout shells.

## Core rule

> **The page is the layout.** Feature components are siblings composed by the page. Feature components do not compose other feature components.

## Allowed patterns

### 1. Page owns the grid

The page imports feature components and places them in a root element styled by the **page CSS module** (e.g. `pages/chat/index.module.css`).

```tsx
// src/pages/chat/index.tsx
import styles from "./index.module.css";
import { ChatTreeSidebar } from "~/components/chat-tree/ChatTreeSidebar";
import { ChatView } from "~/components/chat-view/ChatView";
import { ChatContextPanel } from "~/components/chat-context/ChatContextPanel";
import { useChatPageState } from "~/hooks/useChatPageState";

export default function ChatPage() {
  const state = useChatPageState();

  return (
    <div className={styles.root}>
      <ChatTreeSidebar {...state.tree} />
      <ChatView {...state.chat}>
        <ChatInput onSend={state.chat.send} />
        <ChatStatusBar status={state.chat.status} />
      </ChatView>
      <ChatContextPanel {...state.context} />
    </div>
  );
}
```

`ChatView` may accept **primitive children** (`ChatInput`, `ChatStatusBar`) passed from the page — not imported internally from sibling feature folders.

### 2. Feature components use primitives only

Inside `ChatView`, only import from:

- `~/components/primitives/*`
- Same feature folder subcomponents that are **leaf UI** (e.g. `MessageBubble`, not `ChatTreeSidebar`)

### 3. State at page level

- Page-level hooks (`useChatPageState`) or React context providers wrap the page return.
- Feature components receive data and callbacks via props.
- No feature component imports another feature folder.

### 4. Shared navigation

**Chosen approach:** `NavBar` rendered from `src/pages/_app.tsx` above `{Component}`.

Requirements:

- Links only: `/chat`, `/settings`, `/admin` (admin link hidden if not admin).
- Must not import `ChatTreeSidebar`, `ChatView`, `AdminProvidersSection`, etc.

## Disallowed patterns

| Anti-pattern | Why |
|--------------|-----|
| `ChatLayout` wrapping sidebars + view | Hides structure from page file |
| `ChatView` importing `ChatTreeSidebar` | Cross-feature coupling |
| `AppShell` with `{children}` slot | Same as layout shell |
| Admin form inside `ChatContextPanel` | Wrong route boundary |
| `components/layout/ThreeColumnLayout` | Page CSS should own columns |

## Component taxonomy

### Primitives (`components/primitives/`)

Stateless or lightly controlled UI building blocks.

| Component | Role |
|-----------|------|
| `Button` | Click actions |
| `Icon` | SVG from `AppIcon` enum; scales `sm` \| `md` \| `lg` |
| `IconButton` | Icon-only actions |
| `Toast` | Via `OverlayProvider` only |
| `Modal` | Via `OverlayProvider` only |
| `Popover` | Anchored confirm / menu surfaces |
| `Input`, `Textarea` | Text entry |
| `Label` | Form labels |
| `ScrollArea` | Overflow scroll |
| `Checkbox` | Selection mode |
| `Select` | Dropdowns |
| `ContextMenu` | Right-click menus |
| `NavBar` | App-wide links (used in `_app`) |
| `Modal`, `ConfirmDialog` | Overlays |

Primitives must not import from `chat-tree`, `chat-view`, `chat-context`, `admin`, or `settings`.

### Feature components

| Folder | Top-level exports | May contain |
|--------|-------------------|-------------|
| `chat-tree/` | `ChatTreeSidebar` | `ChatTreeItem`, `ProjectListItem` |
| `chat-view/` | `ChatView` | `MessageList`, `MessageBubble`, `MessageActions`, `Composer`, `AttachmentPreview`, `ToolToggleList`, `ChatInput`, `ChatStatusBar` |
| `chat-context/` | `ChatContextPanel` | `ContextPanelTabs`, `SystemPromptEditor`, `SamplerFields`, `ExportActions`, `ProjectDataPanel` |
| `overlays/` | `OverlayProvider` | Toast queue, modal stack (used from `_app.tsx`) |
| `admin/` | `AdminProvidersSection`, `AdminModelsSection`, `AdminWhitelistSection` | Form rows, tables (primitives inside) |
| `settings/` | `SettingsProfileSection`, `SettingsPreferencesSection`, `SettingsAppearanceSection` | Form fields |

## Per-route component lists

### `/chat` — `src/pages/chat/index.tsx` (layout template)

**No `chatId` in URL.** Page shows the three-column structure with empty/placeholder states in `ChatView` (e.g. “Select a chat”). Does not call `message.list`.

| Order (DOM) | Component | CSS region |
|-------------|-----------|------------|
| 1 | `ChatTreeSidebar` | `grid-area: sidebar-left` |
| 2 | `ChatView` (empty state) | `grid-area: main` |
| 3 | `ChatContextPanel` (disabled or generic) | `grid-area: sidebar-right` |

### `/chat/[chatId]` — `src/pages/chat/[chatId].tsx` (data route)

**Same sibling list as `/chat`.** Page hook reads `router.query.chatId`, fetches thread data, passes props down. JSX structure must match `index.tsx` line-for-line (duplicate or shared default export from a file that exports only the page component function).

| Order (DOM) | Component | Notes |
|-------------|-----------|-------|
| 1 | `ChatTreeSidebar` | `selectedChatId={chatId}` |
| 2 | `ChatView` | Hydrated messages |
| 3 | `ChatContextPanel` | Tabs: Chat + Project data (if `projectId`) |

Optional page-passed children inside `ChatView`: `ChatInput`, `ChatStatusBar`.

### `/admin` — `src/pages/admin/index.tsx`

| Order | Component |
|-------|-----------|
| 1 | `AdminProvidersSection` |
| 2 | `AdminModelsSection` |
| 3 | `AdminWhitelistSection` |

Layout: single column stack or admin grid in **page CSS** — not an `AdminLayout` component.

### `/settings` — `src/pages/settings/index.tsx`

| Order | Component |
|-------|-----------|
| 1 | `SettingsProfileSection` |
| 2 | `SettingsPreferencesSection` |
| 3 | `SettingsAppearanceSection` |

### `/chat/[chatId]` (optional)

Duplicate the same three siblings as `/chat`. Load `chatId` from `useRouter()` in the page hook — do not extract a shared `ChatPageContent` layout component unless it is a **hook only** (no JSX).

## CSS module conventions

| File | Owns |
|------|------|
| `pages/chat/index.module.css` | `.root` grid, column gaps, min-heights, collapse breakpoints |
| `components/chat-tree/ChatTreeSidebar.module.css` | Internal tree styles only |
| `components/chat-view/ChatView.module.css` | Message area, composer layout |
| `components/chat-context/ChatContextPanel.module.css` | Form spacing inside panel |

Panels must not set `grid-template-columns` on the viewport — only the page module does.

## Fork tree indent

Implemented in `ChatTreeItem` (primitive-level row):

```css
.treeItem {
  padding-left: calc(var(--tree-indent) * var(--depth));
}
```

`--depth` comes from `ChatThread.depth` prop. Default `--tree-indent: 12px`.

## Message hover actions

`MessageActions` is a primitive used inside `MessageBubble` (still within `chat-view` feature folder). Actions: redo, prev variant, next variant, retry, copy. Only visible on `role === assistant'` hover.

## Overlay usage in features

- Destructive actions (delete chat, delete messages) → `modal.confirm` from overlay API.
- Success/error feedback → `toast.*`.
- Context menus → `popover` primitive or `ContextMenu` (no native `alert`).

`OverlayProvider` wraps the app in `_app.tsx`; feature components call `useOverlay()` only.

## Global theme

`globals.css` defines `[data-theme="light"]` and `[data-theme="dark"]` variable sets. `ThemeSync` in `_app.tsx` applies `UserSettings.theme` (including `system` via `prefers-color-scheme`).

## Chat index vs [chatId]

**Do not** re-export `[chatId]` from `index` if that would load data on `/chat`. The two pages share JSX shape but `index` omits data hooks; `[chatId]` runs `useChatPageState(chatId)`. Prefer duplicating the sibling JSX block for visibility, or extract `ChatPageView(props)` that is **only** JSX with no data fetching—both route files call it with different props.

## Testing composition

Lint rule (future): eslint-plugin boundaries or custom script failing if:

- `chat-view` imports `chat-tree`
- `pages/*` imports from `server/`

Manual check: open page file — count three top-level feature imports for `/chat`.

## Related documents

- [Features](./features.md)
- [UI layout mockup](./ui-layout.html)
- [Architecture](./architecture.md)
